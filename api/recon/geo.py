"""Vercel serverless geographic-news endpoint."""

from __future__ import annotations

from http.server import BaseHTTPRequestHandler
from urllib.parse import parse_qs, urlparse

from api_common import (
    origin_is_allowed,
    reject_disallowed_origin,
    send_json,
)
from geo_service import collect_geo_news


class handler(BaseHTTPRequestHandler):
    def log_message(self, *_args) -> None:
        """Do not log client IPs or full request URLs."""
        return

    def do_GET(self):
        if reject_disallowed_origin(
            self,
            methods="GET, OPTIONS",
        ):
            return

        params = parse_qs(
            urlparse(self.path).query,
            max_num_fields=5,
        )
        country_code = params.get(
            "country_code",
            [""],
        )[0].upper()
        if len(country_code) != 2 or not country_code.isalpha():
            send_json(
                self,
                400,
                {"detail": ("country_code must be a two-letter code.")},
                methods="GET, OPTIONS",
            )
            return

        try:
            result = collect_geo_news(country_code)
            send_json(
                self,
                200,
                result,
                methods="GET, OPTIONS",
                cache_control=("public, s-maxage=300, stale-while-revalidate=600"),
            )
        except Exception:
            send_json(
                self,
                502,
                {
                    "sector": country_code,
                    "status": "RECON_FAILED",
                    "count": 0,
                    "data": [],
                },
                methods="GET, OPTIONS",
            )

    def do_OPTIONS(self):
        if not origin_is_allowed(self):
            send_json(
                self,
                403,
                {"detail": "Origin is not allowed."},
                methods="GET, OPTIONS",
            )
            return
        send_json(
            self,
            204,
            {},
            methods="GET, OPTIONS",
        )
