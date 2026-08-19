"""FastAPI entry point for PRISM."""

from __future__ import annotations

import asyncio
import logging
import os
import time
from urllib.parse import urlsplit

import uvicorn
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, ValidationError
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse

from analysis_engine import (
    AnalysisEngineError,
    analyze_article,
)
from article_extractor import extract_article
from geo_service import collect_geo_news
from rate_limit import (
    anonymise_client,
    build_rate_limiter,
    get_client_ip,
    is_production,
)
from url_security import UnsafeURLError, validate_public_url

load_dotenv()
logging.basicConfig(
    level=os.getenv("LOG_LEVEL", "INFO"),
    format="%(asctime)s %(levelname)s %(name)s %(message)s",
)
logger = logging.getLogger("prism.api")

MAX_REQUEST_BYTES = 4096
MIN_ARTICLE_CHARACTERS = 500
MAX_CONCURRENT_ANALYSES = max(
    1,
    int(os.getenv("MAX_CONCURRENT_ANALYSES", "2")),
)


def _allowed_origins() -> list[str]:
    raw = os.getenv(
        "ALLOWED_ORIGINS",
        "" if is_production() else "http://localhost:5173",
    )
    origins = [
        origin.strip().rstrip("/") for origin in raw.split(",") if origin.strip()
    ]
    if "*" in origins:
        raise RuntimeError("Wildcard CORS origins are not permitted.")
    for origin in origins:
        parsed = urlsplit(origin)
        if (
            parsed.scheme not in {"http", "https"}
            or not parsed.netloc
            or parsed.path not in {"", "/"}
            or parsed.query
            or parsed.fragment
        ):
            raise RuntimeError(f"Invalid ALLOWED_ORIGINS entry: {origin}")
    if is_production() and not origins:
        raise RuntimeError("ALLOWED_ORIGINS is required in production.")
    return origins


if (
    is_production()
    and not os.getenv(
        "OPENAI_API_KEY",
        "",
    ).strip()
):
    raise RuntimeError("OPENAI_API_KEY is required in production.")

rate_limiter = build_rate_limiter()
analysis_slots = asyncio.Semaphore(MAX_CONCURRENT_ANALYSES)
geo_cache: dict[str, tuple[float, dict]] = {}
geo_cache_lock = asyncio.Lock()

app = FastAPI(
    title="PRISM API",
    version="1.1.0",
    docs_url=None if is_production() else "/docs",
    redoc_url=None if is_production() else "/redoc",
    openapi_url=None if is_production() else "/openapi.json",
)


class RequestSizeLimitMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        content_length = request.headers.get("content-length")
        if content_length:
            try:
                if int(content_length) > MAX_REQUEST_BYTES:
                    return JSONResponse(
                        {"detail": "Request body too large."},
                        status_code=413,
                    )
            except ValueError:
                return JSONResponse(
                    {"detail": "Invalid Content-Length header."},
                    status_code=400,
                )
        return await call_next(request)


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["Cache-Control"] = "no-store"
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["Referrer-Policy"] = "no-referrer"
        response.headers["X-Frame-Options"] = "DENY"
        return response


app.add_middleware(RequestSizeLimitMiddleware)
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins(),
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type"],
    max_age=600,
)


class AnalysisRequest(BaseModel):
    url: str = Field(
        min_length=8,
        max_length=2048,
    )


async def _read_analysis_request(request: Request) -> AnalysisRequest:
    body = bytearray()
    async for chunk in request.stream():
        if len(body) + len(chunk) > MAX_REQUEST_BYTES:
            raise HTTPException(
                status_code=413,
                detail="Request body too large.",
            )
        body.extend(chunk)
    try:
        return AnalysisRequest.model_validate_json(bytes(body))
    except ValidationError as exc:
        raise HTTPException(
            status_code=422,
            detail="Request body must contain a valid URL.",
        ) from exc


def _rate_key(request: Request) -> str:
    remote = request.client.host if request.client else None
    client_ip = get_client_ip(request.headers, remote)
    return anonymise_client(client_ip)


def _rate_payload(status) -> dict:
    return {
        "analyses_remaining": status.remaining,
        "analyses_total": status.total,
        "reset_in_seconds": status.reset_in_seconds,
        "reset_in_hours": round(
            status.reset_in_seconds / 3600,
            1,
        ),
    }


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.get("/rate-limit")
async def get_rate_limit_status(request: Request):
    try:
        status = await asyncio.to_thread(
            rate_limiter.peek,
            _rate_key(request),
        )
    except Exception as exc:
        logger.exception("Rate-limit backend unavailable")
        raise HTTPException(
            status_code=503,
            detail="Rate-limit service unavailable.",
        ) from exc
    return _rate_payload(status)


@app.post("/analyze")
async def run_analysis(request: Request):
    analysis_request = await _read_analysis_request(request)
    try:
        validate_public_url(analysis_request.url)
    except UnsafeURLError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc

    try:
        status = await asyncio.to_thread(
            rate_limiter.consume,
            _rate_key(request),
        )
    except Exception as exc:
        logger.exception("Rate-limit backend unavailable")
        raise HTTPException(
            status_code=503,
            detail="Rate-limit service unavailable.",
        ) from exc
    if not status.allowed:
        raise HTTPException(
            status_code=429,
            detail="Analysis limit exceeded.",
            headers={
                "Retry-After": str(status.reset_in_seconds),
            },
        )

    try:
        await asyncio.wait_for(
            analysis_slots.acquire(),
            timeout=0.1,
        )
    except TimeoutError as exc:
        raise HTTPException(
            status_code=503,
            detail="Analysis capacity is temporarily full.",
            headers={"Retry-After": "15"},
        ) from exc

    try:
        raw_text = await asyncio.to_thread(
            extract_article,
            analysis_request.url,
        )
        if not raw_text or len(raw_text) < MIN_ARTICLE_CHARACTERS:
            raise HTTPException(
                status_code=422,
                detail=(
                    "The article could not be extracted. "
                    "It may be paywalled or blocked."
                ),
            )
        return await asyncio.to_thread(
            analyze_article,
            raw_text,
        )
    except UnsafeURLError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc
    except AnalysisEngineError as exc:
        logger.exception("Analysis engine failed")
        raise HTTPException(
            status_code=502,
            detail="The analysis engine could not complete the request.",
        ) from exc
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Article extraction failed")
        raise HTTPException(
            status_code=422,
            detail="The article could not be extracted safely.",
        ) from exc
    finally:
        analysis_slots.release()


@app.get("/recon/geo")
async def geo_recon(
    country_code: str = Query(
        min_length=2,
        max_length=2,
        pattern=r"^[A-Za-z]{2}$",
    ),
):
    code = country_code.upper()
    now = time.monotonic()
    cached = geo_cache.get(code)
    if cached and now - cached[0] < 300:
        return cached[1]

    async with geo_cache_lock:
        cached = geo_cache.get(code)
        if cached and now - cached[0] < 300:
            return cached[1]
        try:
            result = await asyncio.to_thread(
                collect_geo_news,
                code,
            )
        except Exception as exc:
            logger.exception("Geo feed collection failed")
            raise HTTPException(
                status_code=502,
                detail="The news feed is temporarily unavailable.",
            ) from exc
        geo_cache[code] = (time.monotonic(), result)
        return result


if __name__ == "__main__":
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=int(os.getenv("PORT", "8001")),
        proxy_headers=False,
        access_log=False,
    )
