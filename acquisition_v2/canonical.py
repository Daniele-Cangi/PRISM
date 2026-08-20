"""Conservative URL normalization and stable article identities."""

from __future__ import annotations

import hashlib
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

TRACKING_PARAMETERS = {
    "dclid",
    "fbclid",
    "gclid",
    "igshid",
    "mc_cid",
    "mc_eid",
    "mkt_tok",
    "ref",
    "ref_src",
}
TRACKING_PREFIXES = (
    "utm_",
    "vero_",
)


def _normalise_hostname(hostname: str) -> str:
    return hostname.rstrip(".").encode("idna").decode("ascii").lower()


def normalise_url(value: str) -> str:
    """Normalize identity-only URL details without fetching the resource."""
    parsed = urlsplit(value.strip())
    scheme = parsed.scheme.lower()
    if scheme not in {"http", "https"} or not parsed.hostname:
        raise ValueError("Only absolute HTTP(S) URLs can be normalized.")
    if parsed.username is not None or parsed.password is not None:
        raise ValueError("Credentials in URLs are not allowed.")

    hostname = _normalise_hostname(parsed.hostname)
    try:
        port = parsed.port
    except ValueError as exc:
        raise ValueError("The URL port is malformed.") from exc
    default_port = 443 if scheme == "https" else 80
    netloc = hostname if port in {None, default_port} else f"{hostname}:{port}"

    query = [
        (name, value)
        for name, value in parse_qsl(
            parsed.query,
            keep_blank_values=True,
        )
        if name.lower() not in TRACKING_PARAMETERS
        and not name.lower().startswith(TRACKING_PREFIXES)
    ]
    query.sort()
    return urlunsplit(
        (
            scheme,
            netloc,
            parsed.path or "/",
            urlencode(query, doseq=True),
            "",
        )
    )


def stable_article_id(url: str) -> str:
    digest = hashlib.sha256(normalise_url(url).encode("utf-8")).hexdigest()
    return f"article_{digest[:16]}"


def is_google_news_wrapper(url: str) -> bool:
    parsed = urlsplit(url)
    return (
        parsed.hostname is not None
        and _normalise_hostname(parsed.hostname) == "news.google.com"
        and parsed.path.startswith("/rss/articles/")
    )


def _same_hostname(left: str, right: str) -> bool:
    left_host = (urlsplit(left).hostname or "").lower().removeprefix("www.")
    right_host = (urlsplit(right).hostname or "").lower().removeprefix("www.")
    return bool(left_host and left_host == right_host)


def choose_canonical_url(
    original_url: str,
    *,
    final_url: str | None = None,
    advertised_url: str | None = None,
) -> str:
    """Choose a canonical URL without trusting cross-site HTML metadata."""
    base = normalise_url(final_url or original_url)
    if advertised_url:
        try:
            advertised = normalise_url(advertised_url)
        except ValueError:
            advertised = None
        if advertised and _same_hostname(base, advertised):
            return advertised
    return base
