from __future__ import annotations

import asyncio

import pytest
from fastapi import HTTPException
from fastapi.testclient import TestClient
from starlette.requests import Request

from server import _read_analysis_request, app

client = TestClient(app)


def test_health_has_security_headers():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.headers["x-content-type-options"] == "nosniff"
    assert response.headers["cache-control"] == "no-store"


def test_rate_limit_does_not_disclose_ip():
    response = client.get("/rate-limit")
    assert response.status_code == 200
    assert "ip" not in response.json()


def test_analyze_rejects_loopback_before_scraping():
    response = client.post(
        "/analyze",
        json={"url": "http://127.0.0.1/private"},
    )
    assert response.status_code == 400
    assert "private" in response.json()["detail"].lower()


def test_cors_rejects_unlisted_origin():
    response = client.options(
        "/analyze",
        headers={
            "Origin": "https://attacker.example",
            "Access-Control-Request-Method": "POST",
        },
    )
    assert response.status_code == 400
    assert "access-control-allow-origin" not in (response.headers)


def test_streamed_body_is_bounded_without_content_length():
    messages = iter(
        [
            {
                "type": "http.request",
                "body": b"x" * 5000,
                "more_body": False,
            }
        ]
    )

    async def receive():
        return next(messages)

    request = Request(
        {
            "type": "http",
            "method": "POST",
            "path": "/analyze",
            "headers": [],
        },
        receive,
    )

    with pytest.raises(HTTPException) as exc_info:
        asyncio.run(_read_analysis_request(request))

    assert exc_info.value.status_code == 413
