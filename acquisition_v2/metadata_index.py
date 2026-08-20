"""Local metadata-only discovery index for the free acquisition fabric."""

from __future__ import annotations

import json
import re
import sqlite3
from collections.abc import Iterator, Mapping
from contextlib import contextmanager
from dataclasses import dataclass
from datetime import UTC, datetime, timedelta
from enum import StrEnum
from pathlib import Path
from time import struct_time

import feedparser
from lxml import etree

from acquisition_v2.canonical import normalise_url
from acquisition_v2.models import DiscoveredArticle, DiscoverySource
from url_security import read_limited_body, request_with_safe_redirects

MAX_REGISTRY_BYTES = 256 * 1024
MAX_SOURCE_BYTES = 2 * 1024 * 1024
MAX_SOURCE_ITEMS = 200
MAX_REGISTRY_SOURCES = 500
DEFAULT_MAX_AGE_DAYS = 14
SOURCE_ID_PATTERN = re.compile(r"^[a-z0-9][a-z0-9_-]{1,63}$")
QUERY_TOKEN_PATTERN = re.compile(r"[^\W_]{2,}", re.UNICODE)
INDEX_HEADERS = {
    "User-Agent": (
        "PRISM-Acquisition-Spike/2.0 (+https://github.com/Daniele-Cangi/PRISM)"
    ),
    "Accept": (
        "application/rss+xml,application/atom+xml,application/xml,text/xml,*/*;q=0.1"
    ),
}


class MetadataIndexError(RuntimeError):
    pass


class SourceKind(StrEnum):
    RSS = "rss"
    NEWS_SITEMAP = "news_sitemap"


class RefreshStatus(StrEnum):
    UPDATED = "UPDATED"
    NOT_MODIFIED = "NOT_MODIFIED"
    SKIPPED = "SKIPPED"
    FAILED = "FAILED"


@dataclass(frozen=True)
class SourceSpec:
    id: str
    url: str
    kind: SourceKind
    publisher: str | None = None
    language: str | None = None
    country: str | None = None
    poll_minutes: int = 60
    enabled: bool = True

    @classmethod
    def from_mapping(cls, value: Mapping[str, object]) -> SourceSpec:
        source_id = value.get("id")
        url = value.get("url")
        kind = value.get("kind")
        if not isinstance(source_id, str) or not SOURCE_ID_PATTERN.fullmatch(source_id):
            raise ValueError("Registry source id is invalid.")
        if not isinstance(url, str):
            raise ValueError("Registry source URL is invalid.")
        try:
            normalized_url = normalise_url(url)
        except ValueError as exc:
            raise ValueError("Registry source URL is invalid.") from exc
        try:
            parsed_kind = SourceKind(kind)
        except (TypeError, ValueError) as exc:
            raise ValueError("Registry source kind is invalid.") from exc

        publisher = _optional_text(value.get("publisher"), 200, "publisher")
        language = _optional_text(value.get("language"), 32, "language")
        country = _optional_text(value.get("country"), 64, "country")
        poll_minutes = value.get("poll_minutes", 60)
        if (
            not isinstance(poll_minutes, int)
            or isinstance(poll_minutes, bool)
            or not 15 <= poll_minutes <= 1_440
        ):
            raise ValueError("Registry poll_minutes must be between 15 and 1440.")
        enabled = value.get("enabled", True)
        if not isinstance(enabled, bool):
            raise ValueError("Registry enabled flag must be boolean.")

        return cls(
            id=source_id,
            url=normalized_url,
            kind=parsed_kind,
            publisher=publisher,
            language=language,
            country=country,
            poll_minutes=poll_minutes,
            enabled=enabled,
        )


@dataclass(frozen=True)
class RefreshResult:
    source_id: str
    status: RefreshStatus
    discovered_count: int = 0
    stored_count: int = 0
    error: str | None = None


def _optional_text(value: object, max_length: int, field_name: str) -> str | None:
    if value is None:
        return None
    if not isinstance(value, str):
        raise ValueError(f"Registry {field_name} must be text.")
    value = value.strip()
    if not value or len(value) > max_length:
        raise ValueError(f"Registry {field_name} is invalid.")
    return value


def load_source_registry(path: Path) -> list[SourceSpec]:
    if not path.is_file():
        raise MetadataIndexError("Source registry does not exist.")
    if path.stat().st_size > MAX_REGISTRY_BYTES:
        raise MetadataIndexError("Source registry is too large.")
    try:
        payload = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, UnicodeDecodeError, json.JSONDecodeError) as exc:
        raise MetadataIndexError("Source registry is not valid JSON.") from exc
    if not isinstance(payload, dict) or payload.get("schema_version") != 1:
        raise MetadataIndexError("Source registry schema is unsupported.")
    raw_sources = payload.get("sources")
    if not isinstance(raw_sources, list) or len(raw_sources) > MAX_REGISTRY_SOURCES:
        raise MetadataIndexError("Source registry source list is invalid.")

    sources: list[SourceSpec] = []
    ids: set[str] = set()
    urls: set[str] = set()
    for raw_source in raw_sources:
        if not isinstance(raw_source, dict):
            raise MetadataIndexError("Source registry entry is invalid.")
        try:
            source = SourceSpec.from_mapping(raw_source)
        except ValueError as exc:
            raise MetadataIndexError(str(exc)) from exc
        if source.id in ids or source.url in urls:
            raise MetadataIndexError("Source registry contains duplicate entries.")
        ids.add(source.id)
        urls.add(source.url)
        if source.enabled:
            sources.append(source)
    return sources


def _utc_now() -> datetime:
    return datetime.now(UTC)


def _iso(value: datetime) -> str:
    if value.tzinfo is None:
        value = value.replace(tzinfo=UTC)
    return value.astimezone(UTC).isoformat()


def _parse_iso_datetime(value: object) -> datetime | None:
    if not isinstance(value, str) or not value.strip():
        return None
    try:
        parsed = datetime.fromisoformat(value.strip().replace("Z", "+00:00"))
    except ValueError:
        return None
    return parsed.replace(tzinfo=UTC) if parsed.tzinfo is None else parsed


def _feed_datetime(value: struct_time | None) -> datetime | None:
    if not value:
        return None
    return datetime(*value[:6], tzinfo=UTC)


def _rss_candidates(data: bytes, source: SourceSpec) -> list[DiscoveredArticle]:
    feed = feedparser.parse(data)
    publisher_fallback = source.publisher or feed.feed.get("title")
    language = source.language or feed.feed.get("language")
    candidates: list[DiscoveredArticle] = []
    for entry in feed.entries[:MAX_SOURCE_ITEMS]:
        article_url = entry.get("link")
        if not isinstance(article_url, str) or not article_url.startswith(
            ("http://", "https://")
        ):
            continue
        entry_source = entry.get("source") or {}
        publisher = (
            entry_source.get("title") if isinstance(entry_source, dict) else None
        )
        publisher = publisher or publisher_fallback
        title = entry.get("title")
        candidates.append(
            DiscoveredArticle(
                url=article_url,
                title=title if isinstance(title, str) else None,
                publisher=publisher if isinstance(publisher, str) else None,
                published_at=_feed_datetime(
                    entry.get("published_parsed") or entry.get("updated_parsed")
                ),
                language=language if isinstance(language, str) else None,
                country=source.country,
                discovery_source=DiscoverySource.PUBLISHER_RSS,
            )
        )
    return candidates


def _xml_text(node, local_name: str) -> str | None:
    values = node.xpath(f"./*[local-name()='{local_name}']/text()")
    if not values:
        values = node.xpath(f".//*[local-name()='{local_name}']/text()")
    if not values:
        return None
    value = str(values[0]).strip()
    return value or None


def _sitemap_candidates(data: bytes, source: SourceSpec) -> list[DiscoveredArticle]:
    parser = etree.XMLParser(
        resolve_entities=False,
        no_network=True,
        recover=False,
        huge_tree=False,
    )
    try:
        root = etree.fromstring(data, parser=parser)
    except (etree.XMLSyntaxError, ValueError) as exc:
        raise MetadataIndexError("News sitemap XML is invalid.") from exc
    if etree.QName(root).localname != "urlset":
        raise MetadataIndexError(
            "Only explicit news sitemap urlsets are supported; sitemap indexes "
            "must be reviewed and registered separately."
        )

    candidates: list[DiscoveredArticle] = []
    for node in root.xpath("./*[local-name()='url']")[:MAX_SOURCE_ITEMS]:
        article_url = _xml_text(node, "loc")
        if not article_url or not article_url.startswith(("http://", "https://")):
            continue
        title = _xml_text(node, "title")
        publisher = _xml_text(node, "name") or source.publisher
        published_at = _parse_iso_datetime(
            _xml_text(node, "publication_date") or _xml_text(node, "lastmod")
        )
        candidates.append(
            DiscoveredArticle(
                url=article_url,
                title=title,
                publisher=publisher,
                published_at=published_at,
                language=source.language,
                country=source.country,
                discovery_source=DiscoverySource.NEWS_SITEMAP,
            )
        )
    return candidates


def _parse_source(data: bytes, source: SourceSpec) -> list[DiscoveredArticle]:
    if source.kind is SourceKind.RSS:
        return _rss_candidates(data, source)
    return _sitemap_candidates(data, source)


class MetadataIndex:
    """SQLite/FTS metadata catalog. Article bodies are intentionally excluded."""

    def __init__(self, path: Path):
        self.path = path
        self.path.parent.mkdir(parents=True, exist_ok=True)
        self._initialize()

    def _connect(self) -> sqlite3.Connection:
        connection = sqlite3.connect(self.path, timeout=5.0)
        connection.row_factory = sqlite3.Row
        connection.execute("PRAGMA foreign_keys = ON")
        connection.execute("PRAGMA busy_timeout = 5000")
        return connection

    @contextmanager
    def _connection(self) -> Iterator[sqlite3.Connection]:
        connection = self._connect()
        try:
            with connection:
                yield connection
        finally:
            connection.close()

    def _initialize(self) -> None:
        try:
            with self._connection() as connection:
                schema_version = connection.execute("PRAGMA user_version").fetchone()[0]
                if schema_version not in {0, 1}:
                    raise MetadataIndexError("Metadata index schema is unsupported.")
                connection.executescript(
                    """
                    PRAGMA journal_mode = WAL;

                    CREATE TABLE IF NOT EXISTS sources (
                        id TEXT PRIMARY KEY,
                        url TEXT NOT NULL UNIQUE,
                        kind TEXT NOT NULL,
                        publisher TEXT,
                        language TEXT,
                        country TEXT,
                        poll_minutes INTEGER NOT NULL,
                        etag TEXT,
                        last_modified TEXT,
                        last_checked_at TEXT,
                        last_success_at TEXT,
                        last_error TEXT,
                        consecutive_failures INTEGER NOT NULL DEFAULT 0,
                        next_poll_at TEXT
                    );

                    CREATE TABLE IF NOT EXISTS articles (
                        id INTEGER PRIMARY KEY,
                        url TEXT NOT NULL UNIQUE,
                        title TEXT,
                        publisher TEXT,
                        published_at TEXT,
                        language TEXT,
                        country TEXT,
                        discovery_source TEXT NOT NULL,
                        discovery_url TEXT,
                        resolution_method TEXT,
                        resolution_error TEXT,
                        event_hint TEXT,
                        source_id TEXT REFERENCES sources(id) ON DELETE SET NULL,
                        discovered_at TEXT NOT NULL,
                        last_seen_at TEXT NOT NULL
                    );

                    CREATE INDEX IF NOT EXISTS articles_last_seen_idx
                    ON articles(last_seen_at);

                    CREATE INDEX IF NOT EXISTS articles_published_idx
                    ON articles(published_at);

                    CREATE VIRTUAL TABLE IF NOT EXISTS articles_fts USING fts5(
                        title,
                        publisher,
                        event_hint,
                        content='articles',
                        content_rowid='id',
                        tokenize='unicode61 remove_diacritics 2'
                    );

                    CREATE TRIGGER IF NOT EXISTS articles_ai
                    AFTER INSERT ON articles BEGIN
                        INSERT INTO articles_fts(
                            rowid, title, publisher, event_hint
                        ) VALUES (
                            new.id, new.title, new.publisher, new.event_hint
                        );
                    END;

                    CREATE TRIGGER IF NOT EXISTS articles_ad
                    AFTER DELETE ON articles BEGIN
                        INSERT INTO articles_fts(
                            articles_fts, rowid, title, publisher, event_hint
                        ) VALUES (
                            'delete', old.id, old.title, old.publisher, old.event_hint
                        );
                    END;

                    CREATE TRIGGER IF NOT EXISTS articles_au
                    AFTER UPDATE ON articles BEGIN
                        INSERT INTO articles_fts(
                            articles_fts, rowid, title, publisher, event_hint
                        ) VALUES (
                            'delete', old.id, old.title, old.publisher, old.event_hint
                        );
                        INSERT INTO articles_fts(
                            rowid, title, publisher, event_hint
                        ) VALUES (
                            new.id, new.title, new.publisher, new.event_hint
                        );
                    END;
                    """
                )
                connection.execute("PRAGMA user_version = 1")
        except sqlite3.Error as exc:
            raise MetadataIndexError(
                "Metadata index could not be initialized."
            ) from exc

    def register_sources(self, sources: list[SourceSpec]) -> None:
        try:
            with self._connection() as connection:
                for source in sources:
                    connection.execute(
                        """
                        INSERT INTO sources (
                            id, url, kind, publisher, language, country, poll_minutes
                        ) VALUES (?, ?, ?, ?, ?, ?, ?)
                        ON CONFLICT(id) DO UPDATE SET
                            url = excluded.url,
                            kind = excluded.kind,
                            publisher = excluded.publisher,
                            language = excluded.language,
                            country = excluded.country,
                            poll_minutes = excluded.poll_minutes
                        """,
                        (
                            source.id,
                            source.url,
                            source.kind.value,
                            source.publisher,
                            source.language,
                            source.country,
                            source.poll_minutes,
                        ),
                    )
        except sqlite3.Error as exc:
            raise MetadataIndexError(
                "Metadata sources could not be registered."
            ) from exc

    def upsert_candidates(
        self,
        candidates: list[DiscoveredArticle],
        *,
        source_id: str | None = None,
        now: datetime | None = None,
    ) -> int:
        timestamp = _iso(now or _utc_now())
        prepared: list[tuple[object, ...]] = []
        for candidate in candidates:
            try:
                article_url = normalise_url(candidate.url)
            except ValueError:
                continue
            prepared.append(
                (
                    article_url,
                    candidate.title,
                    candidate.publisher,
                    _iso(candidate.published_at) if candidate.published_at else None,
                    candidate.language,
                    candidate.country,
                    candidate.discovery_source.value,
                    candidate.discovery_url,
                    (
                        candidate.resolution_method.value
                        if candidate.resolution_method
                        else None
                    ),
                    candidate.resolution_error,
                    candidate.event_hint,
                    source_id,
                    timestamp,
                    timestamp,
                )
            )

        try:
            with self._connection() as connection:
                connection.executemany(
                    """
                    INSERT INTO articles (
                        url, title, publisher, published_at, language, country,
                        discovery_source, discovery_url, resolution_method,
                        resolution_error, event_hint, source_id, discovered_at,
                        last_seen_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ON CONFLICT(url) DO UPDATE SET
                        title = COALESCE(excluded.title, articles.title),
                        publisher = COALESCE(excluded.publisher, articles.publisher),
                        published_at = COALESCE(
                            excluded.published_at, articles.published_at
                        ),
                        language = COALESCE(excluded.language, articles.language),
                        country = COALESCE(excluded.country, articles.country),
                        discovery_source = excluded.discovery_source,
                        discovery_url = COALESCE(
                            excluded.discovery_url, articles.discovery_url
                        ),
                        resolution_method = COALESCE(
                            excluded.resolution_method, articles.resolution_method
                        ),
                        resolution_error = excluded.resolution_error,
                        event_hint = COALESCE(
                            excluded.event_hint, articles.event_hint
                        ),
                        source_id = COALESCE(excluded.source_id, articles.source_id),
                        last_seen_at = excluded.last_seen_at
                    """,
                    prepared,
                )
        except sqlite3.Error as exc:
            raise MetadataIndexError(
                "Metadata candidates could not be stored."
            ) from exc
        return len(prepared)

    def search(
        self,
        query: str,
        *,
        max_records: int = 15,
        max_age_days: int = DEFAULT_MAX_AGE_DAYS,
    ) -> list[DiscoveredArticle]:
        query = query.strip()
        if not 2 <= len(query) <= 400:
            raise ValueError("Index query must contain between 2 and 400 characters.")
        if not 1 <= max_age_days <= 365:
            raise ValueError("Index max age must be between 1 and 365 days.")
        tokens = QUERY_TOKEN_PATTERN.findall(query.casefold())[:50]
        if not tokens:
            return []
        fts_query = " OR ".join(f'"{token}"*' for token in tokens)
        cutoff = _iso(_utc_now() - timedelta(days=max_age_days))
        limit = min(max(1, max_records), 50)

        try:
            with self._connection() as connection:
                rows = connection.execute(
                    """
                    SELECT
                        a.url, a.title, a.publisher, a.published_at, a.language,
                        a.country, a.discovery_url, a.resolution_method,
                        a.resolution_error
                    FROM articles_fts
                    JOIN articles AS a ON a.id = articles_fts.rowid
                    WHERE articles_fts MATCH ? AND a.last_seen_at >= ?
                    ORDER BY
                        bm25(articles_fts),
                        COALESCE(a.published_at, a.last_seen_at) DESC
                    LIMIT ?
                    """,
                    (fts_query, cutoff, limit),
                ).fetchall()
        except sqlite3.Error as exc:
            raise MetadataIndexError("Metadata index search failed.") from exc

        return [
            DiscoveredArticle(
                url=row["url"],
                title=row["title"],
                publisher=row["publisher"],
                published_at=_parse_iso_datetime(row["published_at"]),
                language=row["language"],
                country=row["country"],
                discovery_source=DiscoverySource.LOCAL_METADATA_INDEX,
                event_hint=query,
                discovery_url=row["discovery_url"],
                resolution_method=row["resolution_method"],
                resolution_error=row["resolution_error"],
            )
            for row in rows
        ]

    def prune(self, *, max_age_days: int = DEFAULT_MAX_AGE_DAYS) -> int:
        if not 1 <= max_age_days <= 365:
            raise ValueError("Index max age must be between 1 and 365 days.")
        cutoff = _iso(_utc_now() - timedelta(days=max_age_days))
        try:
            with self._connection() as connection:
                cursor = connection.execute(
                    "DELETE FROM articles WHERE last_seen_at < ?",
                    (cutoff,),
                )
                return max(cursor.rowcount, 0)
        except sqlite3.Error as exc:
            raise MetadataIndexError("Metadata index pruning failed.") from exc

    def refresh_registry(
        self,
        registry_path: Path,
        *,
        force: bool = False,
    ) -> list[RefreshResult]:
        sources = load_source_registry(registry_path)
        self.register_sources(sources)
        return [self.refresh_source(source, force=force) for source in sources]

    def refresh_source(
        self,
        source: SourceSpec,
        *,
        force: bool = False,
        now: datetime | None = None,
    ) -> RefreshResult:
        self.register_sources([source])
        current_time = now or _utc_now()
        state = self._source_state(source.id)
        next_poll = _parse_iso_datetime(state["next_poll_at"])
        if not force and next_poll and next_poll > current_time:
            return RefreshResult(source.id, RefreshStatus.SKIPPED)

        headers = dict(INDEX_HEADERS)
        if state["etag"]:
            headers["If-None-Match"] = state["etag"]
        if state["last_modified"]:
            headers["If-Modified-Since"] = state["last_modified"]

        try:
            response = request_with_safe_redirects(
                "GET",
                source.url,
                headers=headers,
                timeout=(15.0, 30.0),
            )
            etag = _bounded_header(response.headers.get("ETag"))
            last_modified = _bounded_header(response.headers.get("Last-Modified"))
            if response.status_code == 304:
                response.close()
                self._mark_source_success(
                    source,
                    current_time,
                    etag=etag or state["etag"],
                    last_modified=last_modified or state["last_modified"],
                )
                return RefreshResult(source.id, RefreshStatus.NOT_MODIFIED)
            if response.status_code >= 400:
                status = response.status_code
                response.close()
                raise MetadataIndexError(f"Metadata source returned HTTP {status}.")
            data = read_limited_body(response, MAX_SOURCE_BYTES)
            candidates = _parse_source(data, source)
            stored = self.upsert_candidates(
                candidates,
                source_id=source.id,
                now=current_time,
            )
            self._mark_source_success(
                source,
                current_time,
                etag=etag,
                last_modified=last_modified,
            )
            return RefreshResult(
                source.id,
                RefreshStatus.UPDATED,
                discovered_count=len(candidates),
                stored_count=stored,
            )
        except Exception as exc:
            error = f"{type(exc).__name__}: {exc}"[:500]
            self._mark_source_failure(source, current_time, error)
            return RefreshResult(
                source.id,
                RefreshStatus.FAILED,
                error=error,
            )

    def _source_state(self, source_id: str) -> sqlite3.Row:
        try:
            with self._connection() as connection:
                row = connection.execute(
                    """
                    SELECT etag, last_modified, next_poll_at, consecutive_failures
                    FROM sources
                    WHERE id = ?
                    """,
                    (source_id,),
                ).fetchone()
        except sqlite3.Error as exc:
            raise MetadataIndexError(
                "Metadata source state could not be read."
            ) from exc
        if row is None:
            raise MetadataIndexError("Metadata source is not registered.")
        return row

    def _mark_source_success(
        self,
        source: SourceSpec,
        now: datetime,
        *,
        etag: str | None,
        last_modified: str | None,
    ) -> None:
        next_poll = now + timedelta(minutes=source.poll_minutes)
        try:
            with self._connection() as connection:
                connection.execute(
                    """
                    UPDATE sources
                    SET etag = ?, last_modified = ?, last_checked_at = ?,
                        last_success_at = ?, last_error = NULL,
                        consecutive_failures = 0, next_poll_at = ?
                    WHERE id = ?
                    """,
                    (
                        etag,
                        last_modified,
                        _iso(now),
                        _iso(now),
                        _iso(next_poll),
                        source.id,
                    ),
                )
        except sqlite3.Error as exc:
            raise MetadataIndexError(
                "Metadata source state could not be updated."
            ) from exc

    def _mark_source_failure(
        self,
        source: SourceSpec,
        now: datetime,
        error: str,
    ) -> None:
        state = self._source_state(source.id)
        failures = int(state["consecutive_failures"]) + 1
        backoff_minutes = min(
            source.poll_minutes * (2 ** min(failures, 6)),
            1_440,
        )
        try:
            with self._connection() as connection:
                connection.execute(
                    """
                    UPDATE sources
                    SET last_checked_at = ?, last_error = ?,
                        consecutive_failures = ?, next_poll_at = ?
                    WHERE id = ?
                    """,
                    (
                        _iso(now),
                        error,
                        failures,
                        _iso(now + timedelta(minutes=backoff_minutes)),
                        source.id,
                    ),
                )
        except sqlite3.Error as exc:
            raise MetadataIndexError(
                "Metadata failure state could not be stored."
            ) from exc


def _bounded_header(value: object) -> str | None:
    if not isinstance(value, str):
        return None
    value = value.strip()
    return value[:500] or None
