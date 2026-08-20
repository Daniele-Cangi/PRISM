"""Bounded discovery adapters that emit one internal candidate model."""

from __future__ import annotations

import json
from datetime import UTC, datetime
from time import struct_time
from urllib.parse import urlencode

import feedparser
from bs4 import BeautifulSoup

from acquisition_v2.models import DiscoveredArticle, DiscoverySource
from geo_service import GEO_CONFIG
from url_security import read_limited_body, request_with_safe_redirects

MAX_DISCOVERY_BYTES = 2 * 1024 * 1024
DISCOVERY_HEADERS = {
    "User-Agent": (
        "PRISM-Acquisition-Spike/2.0 "
        "(+https://github.com/Daniele-Cangi/SHADOW-ANALYZER)"
    ),
    "Accept": "application/json,application/rss+xml,application/xml,text/xml",
}


class DiscoveryError(RuntimeError):
    pass


def _fetch(url: str) -> bytes:
    response = request_with_safe_redirects(
        "GET",
        url,
        headers=DISCOVERY_HEADERS,
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
        candidates.append(
            DiscoveredArticle(
                url=entry.get("link", ""),
                title=entry.get("title"),
                publisher=source.get("title"),
                published_at=_feed_datetime(entry.get("published_parsed")),
                language=language,
                country=country,
                discovery_source=DiscoverySource.GOOGLE_NEWS_RSS,
                event_hint=query.strip() if query else None,
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
