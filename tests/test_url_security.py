from __future__ import annotations

import socket

import pytest

import url_security
from url_security import (
    PinnedResponse,
    SafeRequestError,
    UnsafeURLError,
    read_limited_body,
    request_with_safe_redirects,
    validate_public_url,
)

PUBLIC_V4 = "93.184.216.34"


def public_dns(
    _host,
    port,
    **_kwargs,
):
    return [
        (
            socket.AF_INET,
            socket.SOCK_STREAM,
            socket.IPPROTO_TCP,
            "",
            (PUBLIC_V4, port),
        )
    ]


@pytest.mark.parametrize(
    "url",
    [
        "http://127.0.0.1/",
        "http://10.0.0.1/",
        "http://169.254.169.254/latest/meta-data/",
        "http://[::1]/",
        "http://localhost/",
        "file:///etc/passwd",
        "https://user:secret@example.com/",
        "https://example.com:8443/",
        "https://example.com/path with spaces",
        "https://example.com\\@127.0.0.1/",
    ],
)
def test_rejects_unsafe_urls(url):
    with pytest.raises(UnsafeURLError):
        validate_public_url(url)


def test_accepts_public_https(monkeypatch):
    monkeypatch.setattr(
        socket,
        "getaddrinfo",
        public_dns,
    )
    result = validate_public_url("https://example.com/article?q=1")
    assert result.hostname == "example.com"
    assert result.request_target == "/article?q=1"
    assert str(result.addresses[0]) == PUBLIC_V4


def test_rejects_mixed_public_and_private_dns(
    monkeypatch,
):
    def mixed_dns(_host, port, **_kwargs):
        return [
            (
                socket.AF_INET,
                socket.SOCK_STREAM,
                socket.IPPROTO_TCP,
                "",
                (PUBLIC_V4, port),
            ),
            (
                socket.AF_INET,
                socket.SOCK_STREAM,
                socket.IPPROTO_TCP,
                "",
                ("10.0.0.2", port),
            ),
        ]

    monkeypatch.setattr(
        socket,
        "getaddrinfo",
        mixed_dns,
    )
    with pytest.raises(UnsafeURLError):
        validate_public_url("https://example.com/")


class FakeRawResponse:
    def __init__(
        self,
        status=200,
        headers=None,
        chunks=None,
    ):
        self.status = status
        self.headers = headers or {}
        self.chunks = list(chunks or [])
        self.released = False

    def read(self, _size, decode_content):
        assert decode_content
        return self.chunks.pop(0) if self.chunks else b""

    def release_conn(self):
        self.released = True


class FakePool:
    def __init__(self):
        self.closed = False

    def close(self):
        self.closed = True


def test_revalidates_redirect_targets(
    monkeypatch,
):
    monkeypatch.setattr(
        socket,
        "getaddrinfo",
        public_dns,
    )
    calls = []
    first = PinnedResponse(
        FakeRawResponse(
            302,
            {"Location": ("http://127.0.0.1/admin")},
        ),
        FakePool(),
    )

    def fake_request(target, *_args):
        calls.append(target)
        return first

    monkeypatch.setattr(
        url_security,
        "_request_pinned",
        fake_request,
    )
    with pytest.raises(UnsafeURLError):
        request_with_safe_redirects(
            "GET",
            "https://example.com/start",
        )
    assert len(calls) == 1


def test_https_connection_is_pinned_to_ip(
    monkeypatch,
):
    monkeypatch.setattr(
        socket,
        "getaddrinfo",
        public_dns,
    )
    captured = {}

    class CapturingPool(FakePool):
        def __init__(self, **kwargs):
            super().__init__()
            captured.update(kwargs)

        def urlopen(self, *_args, **_kwargs):
            return FakeRawResponse()

    monkeypatch.setattr(
        url_security,
        "HTTPSConnectionPool",
        CapturingPool,
    )
    response = request_with_safe_redirects(
        "GET",
        "https://example.com/article",
    )
    response.close()

    assert captured["host"] == PUBLIC_V4
    assert captured["server_hostname"] == "example.com"
    assert captured["assert_hostname"] == "example.com"


def test_limits_decoded_response_size():
    raw = FakeRawResponse(chunks=[b"a" * 5, b"b" * 6])
    pool = FakePool()
    response = PinnedResponse(raw, pool)

    with pytest.raises(url_security.ResponseTooLargeError):
        read_limited_body(response, 10)
    assert raw.released
    assert pool.closed


def test_http_errors_close_the_connection():
    raw = FakeRawResponse(status=404)
    pool = FakePool()
    response = PinnedResponse(raw, pool)

    with pytest.raises(SafeRequestError):
        response.raise_for_status()

    assert raw.released
