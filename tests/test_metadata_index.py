from __future__ import annotations

import json
import sqlite3
from argparse import Namespace
from contextlib import closing
from datetime import UTC, datetime, timedelta

import pytest

import acquisition_v2.metadata_index as metadata_index
import acquisition_v2.runner as runner
from acquisition_v2.metadata_index import (
    MetadataIndex,
    MetadataIndexError,
    RefreshStatus,
    SourceKind,
    SourceSpec,
    load_source_registry,
)
from acquisition_v2.models import (
    DiscoveredArticle,
    DiscoverySource,
    URLResolutionMethod,
)


class FakeResponse:
    def __init__(self, body=b"", *, status=200, headers=None):
        self.body = body
        self.status_code = status
        self.headers = headers or {}
        self.closed = False

    def close(self):
        self.closed = True


def _candidate(**updates) -> DiscoveredArticle:
    values = {
        "url": "https://publisher.example/iran-hormuz",
        "title": "Iran and Hormuz shipping update",
        "publisher": "Publisher",
        "published_at": datetime.now(UTC),
        "language": "en",
        "country": "US",
        "discovery_source": DiscoverySource.GOOGLE_NEWS_RSS,
        "event_hint": "Iran Hormuz oil sanctions",
        "discovery_url": "https://news.google.com/rss/articles/wrapper",
        "resolution_method": URLResolutionMethod.GOOGLE_NEWS_INTERNAL,
        "rss_content": "This article body must never enter the metadata index.",
    }
    values.update(updates)
    return DiscoveredArticle(**values)


def test_index_stores_searchable_metadata_without_article_body(tmp_path):
    database = tmp_path / "metadata.sqlite3"
    index = MetadataIndex(database)

    assert index.upsert_candidates([_candidate()]) == 1

    results = index.search("Iran Hormuz")
    assert len(results) == 1
    assert results[0].url == "https://publisher.example/iran-hormuz"
    assert results[0].discovery_source is DiscoverySource.LOCAL_METADATA_INDEX
    assert results[0].discovery_url.startswith("https://news.google.com/")
    assert results[0].resolution_method is URLResolutionMethod.GOOGLE_NEWS_INTERNAL

    with closing(sqlite3.connect(database)) as connection:
        columns = {row[1] for row in connection.execute("PRAGMA table_info(articles)")}
    assert "rss_content" not in columns
    assert b"This article body must never" not in database.read_bytes()


def test_index_normalizes_and_deduplicates_urls(tmp_path):
    database = tmp_path / "metadata.sqlite3"
    index = MetadataIndex(database)
    first = _candidate(url="https://publisher.example/story?utm_source=one")
    second = _candidate(
        url="https://publisher.example/story?utm_source=two",
        title="Updated title",
    )

    index.upsert_candidates([first, second])

    with closing(sqlite3.connect(database)) as connection:
        count, title = connection.execute(
            "SELECT COUNT(*), MAX(title) FROM articles"
        ).fetchone()
    assert count == 1
    assert title == "Updated title"


def test_registry_is_bounded_and_rejects_duplicates(tmp_path):
    registry = tmp_path / "sources.json"
    registry.write_text(
        json.dumps(
            {
                "schema_version": 1,
                "sources": [
                    {
                        "id": "example-rss",
                        "url": "https://publisher.example/rss.xml",
                        "kind": "rss",
                    },
                    {
                        "id": "duplicate-url",
                        "url": "https://publisher.example/rss.xml",
                        "kind": "rss",
                    },
                ],
            }
        ),
        encoding="utf-8",
    )

    with pytest.raises(MetadataIndexError, match="duplicate"):
        load_source_registry(registry)


def test_refresh_rss_uses_conditional_headers_and_circuit_interval(
    monkeypatch,
    tmp_path,
):
    rss = b"""
    <rss version="2.0"><channel><title>Publisher Feed</title>
      <item>
        <title>Iran shipping update</title>
        <link>https://publisher.example/shipping</link>
        <pubDate>Thu, 20 Aug 2026 10:00:00 GMT</pubDate>
      </item>
    </channel></rss>
    """
    responses = [
        FakeResponse(
            rss,
            headers={
                "ETag": '"version-1"',
                "Last-Modified": "Thu, 20 Aug 2026 10:00:00 GMT",
            },
        ),
        FakeResponse(status=304),
    ]
    calls = []

    def fake_request(method, url, **kwargs):
        calls.append((method, url, kwargs))
        return responses.pop(0)

    monkeypatch.setattr(
        metadata_index,
        "request_with_safe_redirects",
        fake_request,
    )
    monkeypatch.setattr(
        metadata_index,
        "read_limited_body",
        lambda response, _limit: response.body,
    )
    index = MetadataIndex(tmp_path / "metadata.sqlite3")
    source = SourceSpec(
        id="publisher-rss",
        url="https://publisher.example/rss.xml",
        kind=SourceKind.RSS,
        publisher="Publisher",
        poll_minutes=60,
    )
    started = datetime(2026, 8, 20, 12, 0, tzinfo=UTC)

    updated = index.refresh_source(source, now=started)
    skipped = index.refresh_source(source, now=started + timedelta(minutes=30))
    not_modified = index.refresh_source(
        source,
        now=started + timedelta(minutes=61),
    )

    assert updated.status is RefreshStatus.UPDATED
    assert updated.stored_count == 1
    assert skipped.status is RefreshStatus.SKIPPED
    assert not_modified.status is RefreshStatus.NOT_MODIFIED
    assert len(calls) == 2
    assert calls[1][2]["headers"]["If-None-Match"] == '"version-1"'


def test_refresh_failure_activates_backoff(monkeypatch, tmp_path):
    calls = []

    def fake_request(*_args, **_kwargs):
        calls.append(True)
        return FakeResponse(status=429)

    monkeypatch.setattr(
        metadata_index,
        "request_with_safe_redirects",
        fake_request,
    )
    index = MetadataIndex(tmp_path / "metadata.sqlite3")
    source = SourceSpec(
        id="limited-rss",
        url="https://publisher.example/rss.xml",
        kind=SourceKind.RSS,
        poll_minutes=60,
    )
    started = datetime(2026, 8, 20, 12, 0, tzinfo=UTC)

    failed = index.refresh_source(source, now=started)
    skipped = index.refresh_source(
        source,
        now=started + timedelta(minutes=90),
    )

    assert failed.status is RefreshStatus.FAILED
    assert "HTTP 429" in failed.error
    assert skipped.status is RefreshStatus.SKIPPED
    assert len(calls) == 1


def test_news_sitemap_parser_extracts_metadata_only():
    source = SourceSpec(
        id="publisher-sitemap",
        url="https://publisher.example/news-sitemap.xml",
        kind=SourceKind.NEWS_SITEMAP,
        publisher="Publisher",
        language="en",
        country="US",
    )
    sitemap = b"""<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
            xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
      <url>
        <loc>https://publisher.example/world/story</loc>
        <news:news>
          <news:publication>
            <news:name>Publisher News</news:name>
            <news:language>en</news:language>
          </news:publication>
          <news:publication_date>2026-08-20T10:30:00Z</news:publication_date>
          <news:title>World event headline</news:title>
        </news:news>
      </url>
    </urlset>
    """

    candidates = metadata_index._sitemap_candidates(sitemap, source)

    assert len(candidates) == 1
    assert candidates[0].title == "World event headline"
    assert candidates[0].publisher == "Publisher News"
    assert candidates[0].discovery_source is DiscoverySource.NEWS_SITEMAP


def test_news_sitemap_index_requires_explicit_child_registration():
    source = SourceSpec(
        id="publisher-sitemap",
        url="https://publisher.example/sitemap.xml",
        kind=SourceKind.NEWS_SITEMAP,
    )

    with pytest.raises(MetadataIndexError, match="registered separately"):
        metadata_index._sitemap_candidates(
            b"<sitemapindex><sitemap><loc>https://example.com/child.xml</loc>"
            b"</sitemap></sitemapindex>",
            source,
        )


def test_runner_defaults_to_free_index_and_google_fabric(monkeypatch, tmp_path):
    discovered = _candidate(
        url="https://publisher.example/free-fabric",
        title="Free fabric discovery result",
    )
    google_calls = []

    def fake_google_news(**kwargs):
        google_calls.append(kwargs)
        return [discovered]

    monkeypatch.setenv("BRAVE_SEARCH_API_KEY", "configured-but-optional")
    monkeypatch.setattr(runner, "discover_google_news", fake_google_news)
    monkeypatch.setattr(
        runner,
        "discover_brave_news",
        lambda *_args, **_kwargs: pytest.fail("Brave must not be a default source"),
    )
    args = Namespace(
        query="free fabric discovery",
        source=None,
        url=[],
        rss=[],
        index_db=tmp_path / "fabric.sqlite3",
        source_registry=tmp_path / "sources.json",
        refresh_index=False,
        force_index_refresh=False,
        index_max_age_days=14,
        country="US",
        resolve_google_wrappers=True,
        max_candidates=15,
        search_language="en",
        brave_freshness="pw",
    )

    first_candidates, first_errors = runner._discover(args)

    assert not first_errors
    assert len(first_candidates) == 1
    assert google_calls[0]["resolve_wrappers"] is True

    args.source = ["index"]
    cached_candidates, cached_errors = runner._discover(args)

    assert not cached_errors
    assert len(cached_candidates) == 1
    assert cached_candidates[0].discovery_source is DiscoverySource.LOCAL_METADATA_INDEX
