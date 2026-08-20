"""SSRF-resistant validation and IP-pinned HTTP fetching."""

from __future__ import annotations

import ipaddress
import socket
from dataclasses import dataclass
from urllib.parse import urljoin, urlsplit, urlunsplit

import certifi
import urllib3
from urllib3.connectionpool import (
    HTTPConnectionPool,
    HTTPSConnectionPool,
)
from urllib3.util import Timeout

MAX_URL_LENGTH = 2048
MAX_REDIRECTS = 5
MAX_REQUEST_BODY_BYTES = 64 * 1024
REDIRECT_STATUSES = {301, 302, 303, 307, 308}
SENSITIVE_REQUEST_HEADERS = frozenset(
    {
        "authorization",
        "cookie",
        "proxy-authorization",
        "x-api-key",
        "x-api-token",
        "x-subscription-token",
    }
)
BLOCKED_HOST_SUFFIXES = (
    ".home.arpa",
    ".internal",
    ".intranet",
    ".lan",
    ".local",
    ".localhost",
)


class UnsafeURLError(ValueError):
    """Raised when a target could reach a non-public resource."""


class SafeRequestError(RuntimeError):
    """Raised when a validated target cannot be fetched."""


class ResponseTooLargeError(SafeRequestError):
    """Raised before buffering more than the configured limit."""


@dataclass(frozen=True)
class ValidatedURL:
    url: str
    scheme: str
    hostname: str
    port: int
    request_target: str
    addresses: tuple[
        ipaddress.IPv4Address | ipaddress.IPv6Address,
        ...,
    ]


class PinnedResponse:
    def __init__(
        self,
        response: urllib3.response.BaseHTTPResponse,
        pool: HTTPConnectionPool | HTTPSConnectionPool,
        *,
        url: str | None = None,
    ):
        self._response = response
        self._pool = pool
        self.url = url

    @property
    def status_code(self) -> int:
        return self._response.status

    @property
    def headers(self):
        return self._response.headers

    def raise_for_status(self) -> None:
        if 400 <= self.status_code:
            self.close()
            raise SafeRequestError("The remote server returned an error status.")

    def close(self) -> None:
        self._response.release_conn()
        self._pool.close()

    def read_limited(self, max_bytes: int) -> bytes:
        chunks: list[bytes] = []
        total = 0
        try:
            while True:
                chunk = self._response.read(
                    64 * 1024,
                    decode_content=True,
                )
                if not chunk:
                    break
                total += len(chunk)
                if total > max_bytes:
                    raise ResponseTooLargeError("The remote response is too large.")
                chunks.append(chunk)
        finally:
            self.close()
        return b"".join(chunks)


def _normalise_hostname(hostname: str) -> str:
    hostname = hostname.rstrip(".").lower()
    try:
        return hostname.encode("idna").decode("ascii")
    except UnicodeError as exc:
        raise UnsafeURLError("The hostname is not valid.") from exc


def _is_blocked_hostname(hostname: str) -> bool:
    return (
        hostname == "localhost"
        or hostname.endswith(BLOCKED_HOST_SUFFIXES)
        or hostname
        in {
            "metadata.google.internal",
            "instance-data",
        }
    )


def _resolve(
    hostname: str,
    port: int,
) -> tuple[
    ipaddress.IPv4Address | ipaddress.IPv6Address,
    ...,
]:
    try:
        records = socket.getaddrinfo(
            hostname,
            port,
            type=socket.SOCK_STREAM,
        )
    except socket.gaierror as exc:
        raise UnsafeURLError("The hostname could not be resolved.") from exc

    addresses = tuple(
        sorted(
            {ipaddress.ip_address(record[4][0].split("%", 1)[0]) for record in records},
            key=str,
        )
    )
    if not addresses:
        raise UnsafeURLError("The hostname did not resolve to an address.")
    if any(not address.is_global for address in addresses):
        raise UnsafeURLError("Private or non-public network targets are not allowed.")
    return addresses


def _validated_addresses(
    hostname: str,
    port: int,
) -> tuple[
    ipaddress.IPv4Address | ipaddress.IPv6Address,
    ...,
]:
    try:
        literal = ipaddress.ip_address(hostname)
    except ValueError:
        return _resolve(hostname, port)
    if not literal.is_global:
        raise UnsafeURLError("Private or non-public network targets are not allowed.")
    return (literal,)


def validate_public_url(value: str) -> ValidatedURL:
    """Validate a web URL and all of its current DNS answers."""
    if not isinstance(value, str):
        raise UnsafeURLError("The URL must be a string.")

    url = value.strip()
    if not url or len(url) > MAX_URL_LENGTH:
        raise UnsafeURLError(
            f"The URL must contain at most {MAX_URL_LENGTH} characters."
        )
    if any(character.isspace() for character in url) or "\\" in url:
        raise UnsafeURLError("The URL contains invalid characters.")

    try:
        parsed = urlsplit(url)
        explicit_port = parsed.port
    except ValueError as exc:
        raise UnsafeURLError("The URL is malformed.") from exc

    scheme = parsed.scheme.lower()
    if scheme not in {"http", "https"}:
        raise UnsafeURLError("Only http and https URLs are allowed.")
    if not parsed.hostname:
        raise UnsafeURLError("The URL must include a hostname.")
    if parsed.username is not None or parsed.password is not None:
        raise UnsafeURLError("Credentials in URLs are not allowed.")

    hostname = _normalise_hostname(parsed.hostname)
    if _is_blocked_hostname(hostname):
        raise UnsafeURLError("Local network hostnames are not allowed.")

    expected_port = 443 if scheme == "https" else 80
    port = explicit_port or expected_port
    if port != expected_port:
        raise UnsafeURLError("Only the standard port for the URL scheme is allowed.")

    request_target = urlunsplit(
        (
            "",
            "",
            parsed.path or "/",
            parsed.query,
            "",
        )
    )
    diagnostic_url = urlunsplit(
        (
            parsed.scheme,
            parsed.netloc,
            parsed.path,
            parsed.query,
            "",
        )
    )
    return ValidatedURL(
        url=diagnostic_url,
        scheme=scheme,
        hostname=hostname,
        port=port,
        request_target=request_target,
        addresses=_validated_addresses(
            hostname,
            port,
        ),
    )


def _host_header(target: ValidatedURL) -> str:
    if ":" in target.hostname:
        return f"[{target.hostname}]"
    return target.hostname


def _request_pinned(
    target: ValidatedURL,
    method: str,
    headers: dict[str, str] | None,
    body: bytes | None,
    timeout: tuple[float, float],
) -> PinnedResponse:
    request_headers = dict(headers or {})
    request_headers["Host"] = _host_header(target)
    request_timeout = Timeout(
        connect=timeout[0],
        read=timeout[1],
    )
    last_error: Exception | None = None

    for address in target.addresses:
        pool: HTTPConnectionPool | HTTPSConnectionPool
        if target.scheme == "https":
            pool = HTTPSConnectionPool(
                host=str(address),
                port=target.port,
                timeout=request_timeout,
                maxsize=1,
                block=True,
                cert_reqs="CERT_REQUIRED",
                ca_certs=certifi.where(),
                assert_hostname=target.hostname,
                server_hostname=target.hostname,
            )
        else:
            pool = HTTPConnectionPool(
                host=str(address),
                port=target.port,
                timeout=request_timeout,
                maxsize=1,
                block=True,
            )

        try:
            response = pool.urlopen(
                method,
                target.request_target,
                headers=request_headers,
                body=body,
                redirect=False,
                preload_content=False,
                retries=False,
            )
            return PinnedResponse(
                response,
                pool,
                url=target.url,
            )
        except Exception as exc:
            last_error = exc
            pool.close()

    raise SafeRequestError(
        "The remote server could not be reached safely."
    ) from last_error


def request_with_safe_redirects(
    method: str,
    url: str,
    *,
    headers: dict[str, str] | None = None,
    body: bytes | None = None,
    timeout: tuple[float, float] = (
        5.0,
        20.0,
    ),
    max_redirects: int = MAX_REDIRECTS,
) -> PinnedResponse:
    """Fetch while pinning and revalidating every hop."""
    if body is not None:
        if not isinstance(body, bytes):
            raise UnsafeURLError("The request body must be bytes.")
        if len(body) > MAX_REQUEST_BODY_BYTES:
            raise UnsafeURLError(
                f"The request body must contain at most {MAX_REQUEST_BODY_BYTES} bytes."
            )

    current_url = url
    current_method = method.upper()

    current_body = body
    for redirect_count in range(max_redirects + 1):
        target = validate_public_url(current_url)
        response = _request_pinned(
            target,
            current_method,
            headers,
            current_body,
            timeout,
        )
        if response.status_code not in REDIRECT_STATUSES:
            return response

        status_code = response.status_code
        location = response.headers.get("Location")
        response.close()
        if not location:
            raise UnsafeURLError("The redirect response did not contain a destination.")
        if redirect_count == max_redirects:
            raise UnsafeURLError("The URL exceeded the redirect limit.")

        current_url = urljoin(
            current_url,
            location,
        )
        redirect_target = validate_public_url(current_url)
        origin_changed = (
            redirect_target.scheme,
            redirect_target.hostname,
            redirect_target.port,
        ) != (target.scheme, target.hostname, target.port)
        if origin_changed and any(
            name.casefold() in SENSITIVE_REQUEST_HEADERS for name in (headers or {})
        ):
            raise UnsafeURLError("Sensitive headers cannot cross an origin redirect.")
        if current_body is not None and status_code in {301, 302, 303}:
            current_method = "GET"
            current_body = None
        elif current_body is not None and origin_changed:
            raise UnsafeURLError("A request body cannot cross an origin redirect.")
        elif status_code == 303 and current_method != "HEAD":
            current_method = "GET"

    raise UnsafeURLError("The URL exceeded the redirect limit.")


def read_limited_body(
    response: PinnedResponse,
    max_bytes: int,
) -> bytes:
    return response.read_limited(max_bytes)
