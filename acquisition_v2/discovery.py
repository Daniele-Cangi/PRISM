"""Bounded discovery adapters that emit one internal candidate model."""

from __future__ import annotations

import json
from datetime import UTC, datetime
from time import struct_time
from urllib.parse import urlencode, urlsplit

import feedparser
from bs4 import BeautifulSoup

from acquisition_v2.google_resolver import (
    GoogleNewsResolutionError,
    resolve_google_news_url,
)
from acquisition_v2.models import (
    DiscoveredArticle,
    DiscoverySource,
    URLResolutionMethod,
)
from geo_service import GEO_CONFIG
from url_security import read_limited_body, request_with_safe_redirects

MAX_DISCOVERY_BYTES = 2 * 1024 * 1024
BRAVE_NEWS_URL = "https://api.search.brave.com/res/v1/news/search"
DISCOVERY_HEADERS = {
    "User-Agent": (
        "PRISM-Acquisition-Spike/2.0 (+https://github.com/Daniele-Cangi/PRISM)"
    ),
    "Accept": "application/json,application/rss+xml,application/xml,text/xml",
}


class DiscoveryError(RuntimeError):
    pass


def _fetch(url: str, *, headers: dict[str, str] | None = None) -> bytes:
    response = request_with_safe_redirects(
        "GET",
        url,
        headers=headers or DISCOVERY_HEADERS,
        timeout=(30.0, 45.0),
    )
    try:
        if response.status_code >= 400:
            raise DiscoveryError(
                f"Discovery endpoint returned HTTP {response.status_code}."
            )
        response.raise_for_status()
        return read_limited_body(response, MAX_DISCOVERY_BYTES)
    except Exception:
        response.close()
        raise


def _feed_datetime(value: struct_time | None) -> datetime | None:
    if not value:
        return None
    return datetime(*value[:6], tzinfo=UTC)


def _gdelt_datetime(value: object) -> datetime | None:
    if not isinstance(value, str):
        return None
    for pattern in (
        "%Y%m%dT%H%M%SZ",
        "%Y%m%dT%H%M%S",
        "%Y-%m-%dT%H:%M:%SZ",
    ):
        try:
            return datetime.strptime(value, pattern).replace(tzinfo=UTC)
        except ValueError:
            continue
    return None


def _rss_content(entry) -> str | None:
    content = entry.get("content") or []
    raw = content[0].get("value") if content and isinstance(content[0], dict) else None
    raw = raw or entry.get("summary")
    if not isinstance(raw, str):
        return None
    text = BeautifulSoup(raw, "lxml").get_text("\n", strip=True)
    return text[:25_000] or None


def direct_candidate(
    url: str,
    *,
    title: str | None = None,
    event_hint: str | None = None,
) -> DiscoveredArticle:
    return DiscoveredArticle(
        url=url,
        title=title,
        discovery_source=DiscoverySource.DIRECT_URL,
        event_hint=event_hint,
    )


def _brave_datetime(value: object) -> datetime | None:
    if not isinstance(value, str):
        return None
    try:
        parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError:
        return None
    return parsed.replace(tzinfo=UTC) if parsed.tzinfo is None else parsed


def _validate_brave_freshness(value: str) -> str:
    freshness = value.strip().lower()
    if freshness in {"pd", "pw", "pm", "py"}:
        return freshness
    dates = freshness.split("to")
    if len(dates) == 2:
        try:
            for current in dates:
                datetime.strptime(current, "%Y-%m-%d")
        except ValueError:
            pass
        else:
            return freshness
    raise ValueError("Invalid Brave News freshness filter.")


def discover_brave_news(
    query: str,
    *,
    api_key: str,
    country_code: str = "US",
    search_language: str = "en",
    freshness: str = "pw",
    max_records: int = 15,
) -> list[DiscoveredArticle]:
    """Discover direct publisher URLs through Brave News Search."""
    query = query.strip()
    if not 2 <= len(query) <= 400 or len(query.split()) > 50:
        raise ValueError(
            "Brave query must contain 2-400 characters and at most 50 words."
        )
    api_key = api_key.strip()
    if not api_key or len(api_key) > 1_024:
        raise ValueError("A valid Brave Search API key is required.")

    country = country_code.strip().upper()
    if country != "ALL" and (len(country) != 2 or not country.isalpha()):
        raise ValueError("Brave country must be a two-letter code or ALL.")
    language = search_language.strip().lower()
    if not 2 <= len(language) <= 5 or not language.replace("-", "").isalpha():
        raise ValueError("Invalid Brave search language.")
    max_records = min(max(1, max_records), 50)

    url = (
        BRAVE_NEWS_URL
        + "?"
        + urlencode(
            {
                "q": query,
                "count": max_records,
                "country": country,
                "search_lang": language,
                "freshness": _validate_brave_freshness(freshness),
                "safesearch": "strict",
                "spellcheck": "true",
            }
        )
    )
    headers = {
        **DISCOVERY_HEADERS,
        "Accept": "application/json",
        "X-Subscription-Token": api_key,
    }
    try:
        payload = json.loads(_fetch(url, headers=headers).decode("utf-8"))
    except (UnicodeDecodeError, json.JSONDecodeError) as exc:
        raise DiscoveryError("Brave returned an invalid discovery response.") from exc

    if not isinstance(payload, dict):
        raise DiscoveryError("Brave returned an invalid discovery object.")
    results = payload.get("results", [])
    if not isinstance(results, list):
        raise DiscoveryError("Brave did not return a news result list.")

    candidates: list[DiscoveredArticle] = []
    for article in results:
        if not isinstance(article, dict):
            continue
        article_url = article.get("url")
        if not isinstance(article_url, str) or not article_url.startswith(
            ("http://", "https://")
        ):
            continue
        meta_url = article.get("meta_url")
        publisher = meta_url.get("hostname") if isinstance(meta_url, dict) else None
        publisher = publisher or urlsplit(article_url).hostname
        title = article.get("title")
        candidates.append(
            DiscoveredArticle(
                url=article_url,
                title=title if isinstance(title, str) else None,
                publisher=publisher if isinstance(publisher, str) else None,
                published_at=_brave_datetime(article.get("page_age")),
                language=language,
                country=None if country == "ALL" else country,
                discovery_source=DiscoverySource.BRAVE_NEWS,
                event_hint=query,
            )
        )
    return candidates[:max_records]


def discover_gdelt(
    query: str,
    *,
    max_records: int = 15,
    timespan: str = "24h",
) -> list[DiscoveredArticle]:
    """Discover direct publisher URLs via GDELT DOC 2.0."""
    query = query.strip()
    if not 2 <= len(query) <= 300:
        raise ValueError("GDELT query must contain between 2 and 300 characters.")
    max_records = min(max(1, max_records), 50)
    url = "https://api.gdeltproject.org/api/v2/doc/doc?" + urlencode(
        {
            "query": query,
            "mode": "artlist",
            "format": "json",
            "maxrecords": max_records,
            "sort": "datedesc",
            "timespan": timespan,
        }
    )

    try:
        payload = json.loads(_fetch(url).decode("utf-8"))
    except (UnicodeDecodeError, json.JSONDecodeError, KeyError) as exc:
        raise DiscoveryError("GDELT returned an invalid discovery response.") from exc

    articles = payload.get("articles", [])
    if not isinstance(articles, list):
        raise DiscoveryError("GDELT did not return an article list.")

    candidates: list[DiscoveredArticle] = []
    for article in articles:
        if not isinstance(article, dict):
            continue
        article_url = article.get("url")
        if not isinstance(article_url, str) or not article_url.startswith(
            ("http://", "https://")
        ):
            continue
        candidates.append(
            DiscoveredArticle(
                url=article_url,
                title=article.get("title"),
                publisher=article.get("domain"),
                published_at=_gdelt_datetime(article.get("seendate")),
                language=article.get("language"),
                country=article.get("sourcecountry"),
                discovery_source=DiscoverySource.GDELT,
                event_hint=query,
            )
        )
    return candidates[:max_records]


def discover_google_news(
    *,
    country_code: str,
    query: str | None = None,
    max_records: int = 15,
    resolve_wrappers: bool = False,
) -> list[DiscoveredArticle]:
    """Discover candidates from the public Google News RSS surface."""
    code = country_code.strip().upper()
    config = GEO_CONFIG.get(code)
    if not config:
        raise ValueError("Unsupported Google News country code.")
    language, country, edition, _name = config
    max_records = min(max(1, max_records), 50)

    path = "search" if query and query.strip() else ""
    params = {
        "hl": language,
        "gl": country,
        "ceid": edition,
    }
    if path:
        params["q"] = query.strip()
    url = f"https://news.google.com/rss/{path}?{urlencode(params)}"

    feed = feedparser.parse(_fetch(url))
    candidates: list[DiscoveredArticle] = []
    for entry in feed.entries[:max_records]:
        source = entry.get("source") or {}
        wrapper_url = entry.get("link", "")
        if not isinstance(wrapper_url, str) or not wrapper_url:
            continue

        article_url = wrapper_url
        discovery_url = None
        resolution_method = None
        resolution_error = None
        if resolve_wrappers:
            discovery_url = wrapper_url
            resolution_method = URLResolutionMethod.GOOGLE_NEWS_INTERNAL
            try:
                article_url = resolve_google_news_url(wrapper_url)
            except GoogleNewsResolutionError as exc:
                resolution_error = f"{type(exc).__name__}: {exc}"[:500]

        candidates.append(
            DiscoveredArticle(
                url=article_url,
                title=entry.get("title"),
                publisher=source.get("title"),
                published_at=_feed_datetime(entry.get("published_parsed")),
                language=language,
                country=country,
                discovery_source=DiscoverySource.GOOGLE_NEWS_RSS,
                event_hint=query.strip() if query else None,
                discovery_url=discovery_url,
                resolution_method=resolution_method,
                resolution_error=resolution_error,
                rss_content=_rss_content(entry),
            )
        )
    return [candidate for candidate in candidates if candidate.url]


def discover_rss(
    feed_url: str,
    *,
    event_hint: str | None = None,
    max_records: int = 15,
) -> list[DiscoveredArticle]:
    """Discover articles from a caller-selected public publisher feed."""
    max_records = min(max(1, max_records), 50)
    feed = feedparser.parse(_fetch(feed_url))
    feed_title = feed.feed.get("title")
    candidates: list[DiscoveredArticle] = []
    for entry in feed.entries[:max_records]:
        url = entry.get("link")
        if not isinstance(url, str) or not url.startswith(("http://", "https://")):
            continue
        source = entry.get("source") or {}
        candidates.append(
            DiscoveredArticle(
                url=url,
                title=entry.get("title"),
                publisher=source.get("title") or feed_title,
                published_at=_feed_datetime(entry.get("published_parsed")),
                language=feed.feed.get("language"),
                discovery_source=DiscoverySource.PUBLISHER_RSS,
                event_hint=event_hint,
                rss_content=_rss_content(entry),
            )
        )
    return candidates
