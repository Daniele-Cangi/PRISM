"""Bounded local and Redis-backed rate limiting."""

from __future__ import annotations

import hashlib
import hmac
import ipaddress
import os
import threading
import time
from collections.abc import Mapping
from dataclasses import dataclass


@dataclass(frozen=True)
class RateLimitStatus:
    allowed: bool
    remaining: int
    total: int
    reset_in_seconds: int


class MemoryRateLimiter:
    """Process-local fallback for development and tests."""

    def __init__(
        self,
        limit: int,
        window_seconds: int,
        max_entries: int = 10_000,
    ):
        self.limit = limit
        self.window_seconds = window_seconds
        self.max_entries = max_entries
        self._entries: dict[str, tuple[int, float]] = {}
        self._lock = threading.Lock()

    def _cleanup(self, now: float) -> None:
        expired = [
            key
            for key, (_, started) in self._entries.items()
            if now - started >= self.window_seconds
        ]
        for key in expired:
            self._entries.pop(key, None)
        if len(self._entries) >= self.max_entries:
            oldest = min(
                self._entries,
                key=lambda key: self._entries[key][1],
            )
            self._entries.pop(oldest, None)

    def _status(self, key: str, consume: bool) -> RateLimitStatus:
        now = time.time()
        with self._lock:
            self._cleanup(now)
            count, started = self._entries.get(key, (0, now))
            if now - started >= self.window_seconds:
                count, started = 0, now

            allowed = count < self.limit
            if consume and allowed:
                count += 1
                self._entries[key] = (count, started)
            elif key not in self._entries:
                self._entries[key] = (count, started)

            reset_in = max(
                1,
                int(self.window_seconds - (now - started)),
            )
            return RateLimitStatus(
                allowed=allowed,
                remaining=max(0, self.limit - count),
                total=self.limit,
                reset_in_seconds=reset_in,
            )

    def consume(self, key: str) -> RateLimitStatus:
        return self._status(key, consume=True)

    def peek(self, key: str) -> RateLimitStatus:
        return self._status(key, consume=False)


class RedisRateLimiter:
    """Atomic fixed-window limiter shared by production instances."""

    _CONSUME_SCRIPT = """
    local count = redis.call('INCR', KEYS[1])
    if count == 1 then
      redis.call('EXPIRE', KEYS[1], ARGV[1])
    end
    local ttl = redis.call('TTL', KEYS[1])
    return {count, ttl}
    """

    def __init__(self, url: str, limit: int, window_seconds: int):
        from redis import Redis

        self.limit = limit
        self.window_seconds = window_seconds
        self._redis = Redis.from_url(
            url,
            decode_responses=True,
            socket_connect_timeout=2,
            socket_timeout=2,
            health_check_interval=30,
        )
        self._consume_script = self._redis.register_script(self._CONSUME_SCRIPT)

    def consume(self, key: str) -> RateLimitStatus:
        count, ttl = self._consume_script(
            keys=[f"prism:analysis:{key}"],
            args=[self.window_seconds],
        )
        count = int(count)
        ttl = int(ttl)
        return RateLimitStatus(
            allowed=count <= self.limit,
            remaining=max(0, self.limit - count),
            total=self.limit,
            reset_in_seconds=max(1, ttl),
        )

    def peek(self, key: str) -> RateLimitStatus:
        redis_key = f"prism:analysis:{key}"
        count = int(self._redis.get(redis_key) or 0)
        ttl = int(self._redis.ttl(redis_key))
        if ttl < 0:
            ttl = self.window_seconds
        return RateLimitStatus(
            allowed=count < self.limit,
            remaining=max(0, self.limit - count),
            total=self.limit,
            reset_in_seconds=max(1, ttl),
        )


def is_production() -> bool:
    return os.getenv("APP_ENV", "").lower() == "production"


def build_rate_limiter():
    limit = int(os.getenv("MAX_ANALYSES_PER_IP", "3"))
    window = int(os.getenv("RATE_LIMIT_WINDOW_SECONDS", "86400"))
    redis_url = os.getenv("RATE_LIMIT_REDIS_URL", "").strip()
    if redis_url:
        return RedisRateLimiter(redis_url, limit, window)
    if is_production():
        raise RuntimeError("RATE_LIMIT_REDIS_URL is required in production.")
    return MemoryRateLimiter(limit, window)


def anonymise_client(client_ip: str) -> str:
    development_salt = "development-only-rate-limit-salt"
    salt = os.getenv("RATE_LIMIT_SALT", development_salt)
    if is_production() and salt == development_salt:
        raise RuntimeError("RATE_LIMIT_SALT is required in production.")
    return hmac.new(
        salt.encode(),
        client_ip.encode(),
        hashlib.sha256,
    ).hexdigest()


def _valid_ip(value: str | None) -> str | None:
    if not value:
        return None
    try:
        return str(ipaddress.ip_address(value.strip()))
    except ValueError:
        return None


def get_client_ip(
    headers: Mapping[str, str],
    remote_ip: str | None,
) -> str:
    """Trust forwarded headers only with an explicit proxy hop count."""
    fallback = _valid_ip(remote_ip) or "0.0.0.0"
    trusted_hops = max(
        0,
        int(os.getenv("TRUSTED_PROXY_HOPS", "0")),
    )
    if trusted_hops == 0:
        return fallback

    forwarded = headers.get("x-forwarded-for") or headers.get("X-Forwarded-For")
    if not forwarded:
        return fallback

    chain = [item.strip() for item in forwarded.split(",") if item.strip()]
    if len(chain) < trusted_hops:
        return fallback
    return _valid_ip(chain[-trusted_hops]) or fallback
