"""Vercel serverless article-analysis endpoint."""

from __future__ import annotations

from http.server import BaseHTTPRequestHandler

from analysis_engine import (
    AnalysisEngineError,
    analyze_article,
)
from api_common import (
    origin_is_allowed,
    read_json_body,
    reject_disallowed_origin,
    send_json,
)
from article_extractor import (
    ExtractionError,
    extract_article,
)
from rate_limit import (
    anonymise_client,
    build_rate_limiter,
    get_client_ip,
)
from url_security import (
    MAX_URL_LENGTH,
    UnsafeURLError,
    validate_public_url,
)

MIN_ARTICLE_CHARACTERS = 500
RATE_LIMITER = build_rate_limiter()


class handler(BaseHTTPRequestHandler):
    def log_message(self, *_args) -> None:
        """Do not log client IPs or submitted URLs."""
        return

    def do_POST(self):
        if reject_disallowed_origin(
            self,
            methods="POST, OPTIONS",
        ):
            return

        try:
            data = read_json_body(self)
            url = data.get("url")
            if not isinstance(url, str) or not 8 <= len(url) <= MAX_URL_LENGTH:
                raise ValueError("A valid URL is required.")
            validate_public_url(url)

            remote_ip = self.client_address[0] if self.client_address else None
            client_ip = get_client_ip(
                self.headers,
                remote_ip,
            )
            status = RATE_LIMITER.consume(anonymise_client(client_ip))
            if not status.allowed:
                send_json(
                    self,
                    429,
                    {"detail": "Analysis limit exceeded."},
                    methods="POST, OPTIONS",
                    extra_headers={"Retry-After": str(status.reset_in_seconds)},
                )
                return

            text = extract_article(url)
            if len(text) < MIN_ARTICLE_CHARACTERS:
                send_json(
                    self,
                    422,
                    {
                        "detail": (
                            "The article could not be extracted. "
                            "It may be paywalled or blocked."
                        )
                    },
                    methods="POST, OPTIONS",
                )
                return

            result = analyze_article(text)
            send_json(
                self,
                200,
                result,
                methods="POST, OPTIONS",
            )
        except (ValueError, UnsafeURLError) as exc:
            send_json(
                self,
                400,
                {"detail": str(exc)},
                methods="POST, OPTIONS",
            )
        except ExtractionError:
            send_json(
                self,
                422,
                {"detail": ("The article could not be extracted safely.")},
                methods="POST, OPTIONS",
            )
        except AnalysisEngineError:
            send_json(
                self,
                502,
                {"detail": ("The analysis engine could not complete the request.")},
                methods="POST, OPTIONS",
            )
        except Exception:
            send_json(
                self,
                503,
                {"detail": ("The service is temporarily unavailable.")},
                methods="POST, OPTIONS",
            )

    def do_OPTIONS(self):
        if not origin_is_allowed(self):
            send_json(
                self,
                403,
                {"detail": "Origin is not allowed."},
                methods="POST, OPTIONS",
            )
            return
        send_json(
            self,
            204,
            {},
            methods="POST, OPTIONS",
        )
