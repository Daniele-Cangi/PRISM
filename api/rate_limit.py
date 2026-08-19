"""Vercel serverless rate-limit status endpoint."""

from __future__ import annotations

from http.server import BaseHTTPRequestHandler

from api_common import (
    origin_is_allowed,
    reject_disallowed_origin,
    send_json,
)
from rate_limit import (
    anonymise_client,
    build_rate_limiter,
    get_client_ip,
)

RATE_LIMITER = build_rate_limiter()


class handler(BaseHTTPRequestHandler):
    def log_message(self, *_args) -> None:
        return

    def do_GET(self):
        if reject_disallowed_origin(
            self,
            methods="GET, OPTIONS",
        ):
            return
        try:
            remote_ip = self.client_address[0] if self.client_address else None
            client_ip = get_client_ip(
                self.headers,
                remote_ip,
            )
            status = RATE_LIMITER.peek(anonymise_client(client_ip))
            send_json(
                self,
                200,
                {
                    "analyses_remaining": (status.remaining),
                    "analyses_total": status.total,
                    "reset_in_seconds": (status.reset_in_seconds),
                    "reset_in_hours": round(
                        status.reset_in_seconds / 3600,
                        1,
                    ),
                },
                methods="GET, OPTIONS",
            )
        except Exception:
            send_json(
                self,
                503,
                {"detail": ("Rate-limit service unavailable.")},
                methods="GET, OPTIONS",
            )

    def do_OPTIONS(self):
        if not origin_is_allowed(self):
            send_json(
                self,
                403,
                {"detail": ("Origin is not allowed.")},
                methods="GET, OPTIONS",
            )
            return
        send_json(
            self,
            204,
            {},
            methods="GET, OPTIONS",
        )
