from __future__ import annotations

import pytest

import rate_limit
from rate_limit import (
    MemoryRateLimiter,
    build_rate_limiter,
    get_client_ip,
)


def test_consumes_attempts_before_limit():
    limiter = MemoryRateLimiter(
        limit=3,
        window_seconds=60,
    )
    statuses = [limiter.consume("client") for _ in range(4)]
    assert [item.allowed for item in statuses] == [
        True,
        True,
        True,
        False,
    ]
    assert statuses[2].remaining == 0
    assert statuses[3].remaining == 0


def test_window_resets(monkeypatch):
    now = [100.0]
    monkeypatch.setattr(
        rate_limit.time,
        "time",
        lambda: now[0],
    )
    limiter = MemoryRateLimiter(
        limit=1,
        window_seconds=10,
    )
    assert limiter.consume("client").allowed
    assert not limiter.consume("client").allowed

    now[0] = 111.0
    assert limiter.consume("client").allowed


def test_forwarded_header_ignored_by_default(
    monkeypatch,
):
    monkeypatch.delenv(
        "TRUSTED_PROXY_HOPS",
        raising=False,
    )
    result = get_client_ip(
        {"x-forwarded-for": "1.2.3.4"},
        "8.8.8.8",
    )
    assert result == "8.8.8.8"


def test_selects_forwarded_ip_from_trusted_side(
    monkeypatch,
):
    monkeypatch.setenv(
        "TRUSTED_PROXY_HOPS",
        "1",
    )
    result = get_client_ip(
        {"x-forwarded-for": ("203.0.113.9, 1.2.3.4")},
        "10.0.0.5",
    )
    assert result == "1.2.3.4"


def test_production_requires_redis(monkeypatch):
    monkeypatch.setenv("APP_ENV", "production")
    monkeypatch.delenv(
        "RATE_LIMIT_REDIS_URL",
        raising=False,
    )
    with pytest.raises(RuntimeError):
        build_rate_limiter()
