"""Shared security helpers for Vercel Python functions."""

from __future__ import annotations

import json
import os
from urllib.parse import urlsplit

from rate_limit import is_production

MAX_REQUEST_BYTES = 4096


def allowed_origins() -> set[str]:
    raw = os.getenv(
        "ALLOWED_ORIGINS",
        "" if is_production() else "http://localhost:5173",
    )
    origins = {
        origin.strip().rstrip("/") for origin in raw.split(",") if origin.strip()
    }
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


ORIGINS = allowed_origins()


def request_origin(handler) -> str | None:
    value = handler.headers.get("Origin")
    return value.rstrip("/") if value else None


def origin_is_allowed(handler) -> bool:
    origin = request_origin(handler)
    return origin is None or origin in ORIGINS


def send_json(
    handler,
    status: int,
    payload: dict,
    *,
    methods: str,
    cache_control: str = "no-store",
    extra_headers: dict[str, str] | None = None,
) -> None:
    body = json.dumps(payload).encode("utf-8")
    handler.send_response(status)
    handler.send_header(
        "Content-Type",
        "application/json; charset=utf-8",
    )
    handler.send_header(
        "Content-Length",
        str(len(body)),
    )
    handler.send_header(
        "Cache-Control",
        cache_control,
    )
    handler.send_header(
        "X-Content-Type-Options",
        "nosniff",
    )
    handler.send_header(
        "Referrer-Policy",
        "no-referrer",
    )
    handler.send_header("Vary", "Origin")
    for name, value in (extra_headers or {}).items():
        handler.send_header(name, value)

    origin = request_origin(handler)
    if origin and origin in ORIGINS:
        handler.send_header(
            "Access-Control-Allow-Origin",
            origin,
        )
        handler.send_header(
            "Access-Control-Allow-Methods",
            methods,
        )
        handler.send_header(
            "Access-Control-Allow-Headers",
            "Content-Type",
        )
    handler.end_headers()
    handler.wfile.write(body)


def read_json_body(handler) -> dict:
    value = handler.headers.get("Content-Length")
    if value is None:
        raise ValueError("Content-Length is required.")
    try:
        length = int(value)
    except ValueError as exc:
        raise ValueError("Content-Length is invalid.") from exc
    if length < 1 or length > MAX_REQUEST_BYTES:
        raise ValueError("Request body size is invalid.")
    try:
        value = json.loads(handler.rfile.read(length))
    except json.JSONDecodeError as exc:
        raise ValueError("Request body must be valid JSON.") from exc
    if not isinstance(value, dict):
        raise ValueError("Request body must be a JSON object.")
    return value


def reject_disallowed_origin(
    handler,
    *,
    methods: str,
) -> bool:
    if origin_is_allowed(handler):
        return False
    send_json(
        handler,
        403,
        {"detail": "Origin is not allowed."},
        methods=methods,
    )
    return True
