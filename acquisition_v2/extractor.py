"""Bounded acquisition and structured article normalization."""

from __future__ import annotations

import hashlib
import json
import re
import time
from dataclasses import dataclass
from datetime import UTC, datetime
from typing import Any
from urllib.parse import urljoin, urlsplit

from bs4 import BeautifulSoup, UnicodeDammit

from acquisition_v2.canonical import (
    choose_canonical_url,
    is_google_news_wrapper,
    normalise_url,
    stable_article_id,
)
from acquisition_v2.models import (
    AcquisitionDiagnostics,
    AcquisitionState,
    ArticleParagraph,
    DiscoveredArticle,
    ExtractionMethod,
    NormalizedArticle,
)
from url_security import (
    ResponseTooLargeError,
    SafeRequestError,
    UnsafeURLError,
    read_limited_body,
    request_with_safe_redirects,
)

EXTRACTION_VERSION = "2.0-spike.1"
MAX_RESPONSE_BYTES = 2 * 1024 * 1024
MAX_ARTICLE_CHARACTERS = 25_000
MIN_PARAGRAPH_CHARACTERS = 40
SUPPORTED_CONTENT_TYPES = {
    "application/xhtml+xml",
    "application/xml",
    "text/html",
    "text/plain",
    "text/xml",
}
ARTICLE_TYPES = {
    "article",
    "blogposting",
    "newsarticle",
    "reportagenewsarticle",
}
HEADERS = {
    "User-Agent": (
        "PRISM-Acquisition-Spike/2.0 (+https://github.com/Daniele-Cangi/PRISM)"
    ),
    "Accept": (
        "text/html,application/xhtml+xml,application/xml;q=0.9,text/plain;q=0.8"
    ),
}


@dataclass
class ParsedMetadata:
    canonical_url: str | None = None
    title: str | None = None
    description: str | None = None
    publisher: str | None = None
    authors: list[str] | None = None
    language: str | None = None
    published_at: datetime | None = None
    updated_at: datetime | None = None
    article_body: str | None = None


def _clean_text(value: Any) -> str | None:
    if not isinstance(value, str):
        return None
    cleaned = re.sub(r"\s+", " ", value).strip()
    return cleaned or None


def _decode_document(body: bytes, content_type: str) -> str:
    """Decode bytes using the declared charset before detector heuristics."""
    match = re.search(
        r"charset\s*=\s*[\"']?([^;\s\"']+)",
        content_type,
        flags=re.IGNORECASE,
    )
    if match:
        try:
            return body.decode(match.group(1), errors="replace")
        except LookupError:
            pass

    try:
        return body.decode("utf-8")
    except UnicodeDecodeError:
        detected = UnicodeDammit(body, is_html=True).unicode_markup
        if detected is not None:
            return detected
        return body.decode("utf-8", errors="replace")


def _parse_datetime(value: Any) -> datetime | None:
    if not isinstance(value, str) or not value.strip():
        return None
    candidate = value.strip().replace("Z", "+00:00")
    try:
        parsed = datetime.fromisoformat(candidate)
    except ValueError:
        return None
    if parsed.tzinfo is None:
        return parsed.replace(tzinfo=UTC)
    return parsed


def _json_ld_nodes(value: Any):
    if isinstance(value, list):
        for item in value:
            yield from _json_ld_nodes(item)
        return
    if not isinstance(value, dict):
        return

    yield value
    graph = value.get("@graph")
    if graph is not None:
        yield from _json_ld_nodes(graph)


def _is_article_node(node: dict[str, Any]) -> bool:
    node_type = node.get("@type")
    values = node_type if isinstance(node_type, list) else [node_type]
    return any(
        isinstance(value, str) and value.lower() in ARTICLE_TYPES for value in values
    )


def _entity_name(value: Any) -> str | None:
    if isinstance(value, str):
        return _clean_text(value)
    if isinstance(value, dict):
        return _clean_text(value.get("name"))
    return None


def _author_names(value: Any) -> list[str]:
    values = value if isinstance(value, list) else [value]
    names: list[str] = []
    for item in values:
        name = _entity_name(item)
        if name and name not in names:
            names.append(name)
    return names[:20]


def _meta_content(soup: BeautifulSoup, *keys: tuple[str, str]) -> str | None:
    for attribute, value in keys:
        tag = soup.find("meta", attrs={attribute: value})
        if tag:
            content = _clean_text(tag.get("content"))
            if content:
                return content
    return None


def parse_metadata(soup: BeautifulSoup) -> ParsedMetadata:
    """Extract article metadata without treating it as trusted evidence."""
    article_node: dict[str, Any] | None = None
    for script in soup.find_all("script", attrs={"type": "application/ld+json"}):
        raw = script.string or script.get_text()
        if not raw.strip():
            continue
        try:
            payload = json.loads(raw)
        except json.JSONDecodeError:
            continue
        except TypeError:
            continue
        article_node = next(
            (node for node in _json_ld_nodes(payload) if _is_article_node(node)),
            article_node,
        )
        if article_node:
            break

    canonical_tag = soup.find("link", rel=lambda value: value and "canonical" in value)
    canonical_url = _clean_text(canonical_tag.get("href")) if canonical_tag else None
    canonical_url = canonical_url or _meta_content(
        soup,
        ("property", "og:url"),
    )

    html_tag = soup.find("html")
    language = _clean_text(html_tag.get("lang")) if html_tag else None

    title_tag = soup.find("title")
    fallback_title = _clean_text(title_tag.get_text()) if title_tag else None

    if not article_node:
        return ParsedMetadata(
            canonical_url=canonical_url,
            title=_meta_content(
                soup,
                ("property", "og:title"),
                ("name", "twitter:title"),
            )
            or fallback_title,
            description=_meta_content(
                soup,
                ("property", "og:description"),
                ("name", "description"),
            ),
            publisher=_meta_content(
                soup,
                ("property", "og:site_name"),
            ),
            authors=[],
            language=language,
        )

    return ParsedMetadata(
        canonical_url=canonical_url,
        title=_clean_text(article_node.get("headline") or article_node.get("name"))
        or _meta_content(soup, ("property", "og:title"))
        or fallback_title,
        description=_clean_text(article_node.get("description"))
        or _meta_content(
            soup,
            ("property", "og:description"),
            ("name", "description"),
        ),
        publisher=_entity_name(article_node.get("publisher"))
        or _meta_content(soup, ("property", "og:site_name")),
        authors=_author_names(article_node.get("author")),
        language=_clean_text(article_node.get("inLanguage")) or language,
        published_at=_parse_datetime(article_node.get("datePublished")),
        updated_at=_parse_datetime(article_node.get("dateModified")),
        article_body=_clean_text(article_node.get("articleBody")),
    )


def _paragraphs_from_container(container) -> list[str]:
    values: list[str] = []
    for tag in container.find_all("p"):
        text = _clean_text(tag.get_text(" ", strip=True))
        if text and len(text) >= MIN_PARAGRAPH_CHARACTERS and text not in values:
            values.append(text[:10_000])
    return values


def _bounded_paragraphs(values: list[str]) -> list[str]:
    output: list[str] = []
    total = 0
    for value in values:
        remaining = MAX_ARTICLE_CHARACTERS - total
        if remaining <= 0:
            break
        text = value[:remaining].strip()
        if len(text) < MIN_PARAGRAPH_CHARACTERS:
            continue
        output.append(text)
        total += len(text)
    return output[:200]


def _split_supplied_text(value: str | None) -> list[str]:
    if not value:
        return []
    soup = BeautifulSoup(value, "lxml")
    from_markup = _paragraphs_from_container(soup)
    if from_markup:
        return _bounded_paragraphs(from_markup)

    plain = soup.get_text("\n", strip=True)
    parts = [_clean_text(part) for part in re.split(r"\n{2,}", plain)]
    useful = [part for part in parts if part and len(part) >= MIN_PARAGRAPH_CHARACTERS]
    if len(useful) <= 1 and len(plain) >= MIN_PARAGRAPH_CHARACTERS:
        useful = [plain]
    return _bounded_paragraphs(useful)


def extract_paragraphs(
    soup: BeautifulSoup,
    *,
    article_body: str | None = None,
) -> tuple[list[str], ExtractionMethod | None]:
    for tag in soup(
        [
            "aside",
            "footer",
            "form",
            "header",
            "iframe",
            "nav",
            "noscript",
            "script",
            "style",
            "svg",
        ]
    ):
        tag.decompose()

    selectors = (
        "[itemprop='articleBody']",
        "article",
        "main",
        "[role='main']",
        "[class*='article-body']",
        "[class*='story-body']",
        "[class*='article-content']",
        "[id*='article-body']",
    )
    candidates = []
    seen: set[int] = set()
    for selector in selectors:
        for container in soup.select(selector):
            marker = id(container)
            if marker not in seen:
                seen.add(marker)
                candidates.append(container)

    body = soup.body or soup
    if id(body) not in seen:
        candidates.append(body)

    best = max(
        (_paragraphs_from_container(container) for container in candidates),
        key=lambda paragraphs: (
            sum(len(value) for value in paragraphs),
            len(paragraphs),
        ),
        default=[],
    )
    best = _bounded_paragraphs(best)

    json_ld_paragraphs = _split_supplied_text(article_body)
    if sum(map(len, json_ld_paragraphs)) > sum(map(len, best)):
        return json_ld_paragraphs, ExtractionMethod.JSON_LD_BODY
    if best:
        return best, ExtractionMethod.HTTP_ARTICLE
    return [], None


def _extract_quotations(soup: BeautifulSoup) -> list[str]:
    values: list[str] = []
    for tag in soup.find_all(["blockquote", "q"]):
        text = _clean_text(tag.get_text(" ", strip=True))
        if text and len(text) >= 20 and text not in values:
            values.append(text[:2_000])
    return values[:100]


def _extract_links(soup: BeautifulSoup, base_url: str) -> list[str]:
    values: list[str] = []
    for tag in soup.find_all("a", href=True):
        candidate = urljoin(base_url, tag["href"])
        if urlsplit(candidate).scheme not in {"http", "https"}:
            continue
        try:
            candidate = normalise_url(candidate)
        except ValueError:
            continue
        if candidate not in values:
            values.append(candidate)
        if len(values) >= 200:
            break
    return values


def _looks_paywalled(soup: BeautifulSoup) -> bool:
    markers = (
        "hard-paywall",
        "meteredcontent",
        "paywall",
        "premium-content",
        "subscribe-to-read",
    )
    html = str(soup).lower()
    if any(marker in html for marker in markers):
        return True
    for script in soup.find_all("script", attrs={"type": "application/ld+json"}):
        raw = (script.string or script.get_text()).lower()
        if '"isaccessibleforfree":false' in raw.replace(" ", ""):
            return True
    return False


def _hash_content(text: str) -> str | None:
    normalized = re.sub(r"\s+", " ", text).strip().casefold()
    if not normalized:
        return None
    return hashlib.sha256(normalized.encode("utf-8")).hexdigest()


def _similarity_hash(text: str) -> str | None:
    tokens = re.findall(r"[^\W_]+", text.casefold(), flags=re.UNICODE)
    if not tokens:
        return None
    vector = [0] * 64
    for token in tokens:
        value = int.from_bytes(
            hashlib.sha256(token.encode("utf-8")).digest()[:8],
            "big",
        )
        for index in range(64):
            vector[index] += 1 if value & (1 << index) else -1
    fingerprint = sum(1 << index for index, weight in enumerate(vector) if weight >= 0)
    return f"{fingerprint:016x}"


def _article_identity(url: str) -> tuple[str, str]:
    try:
        canonical = normalise_url(url)
        return canonical, stable_article_id(canonical)
    except ValueError:
        digest = hashlib.sha256(url.encode("utf-8")).hexdigest()
        return url, f"article_{digest[:16]}"


def _failure_article(
    candidate: DiscoveredArticle,
    *,
    state: AcquisitionState,
    reason: str,
    started_at: float,
    status: int | None = None,
    final_url: str | None = None,
    content_type: str | None = None,
    response_bytes: int = 0,
    warnings: list[str] | None = None,
) -> NormalizedArticle:
    canonical_url, article_id = _article_identity(final_url or candidate.url)
    return NormalizedArticle(
        id=article_id,
        canonical_url=canonical_url,
        original_url=candidate.url,
        discovery_url=candidate.discovery_url,
        resolution_method=candidate.resolution_method,
        resolution_error=candidate.resolution_error,
        publisher=candidate.publisher,
        title=candidate.title,
        language=candidate.language,
        country=candidate.country,
        published_at=candidate.published_at,
        fetched_at=datetime.now(UTC),
        extraction_version=EXTRACTION_VERSION,
        acquisition_state=state,
        extraction_method=(
            ExtractionMethod.STRUCTURED_METADATA
            if candidate.title or candidate.publisher
            else None
        ),
        completeness_score=0.1 if candidate.title else 0,
        discovery_source=candidate.discovery_source,
        diagnostics=AcquisitionDiagnostics(
            http_status=status,
            final_url=final_url,
            content_type=content_type,
            response_bytes=response_bytes,
            duration_ms=max(0, round((time.monotonic() - started_at) * 1000)),
            warnings=warnings or [],
            failure_reason=reason,
        ),
    )


def _state_for_http_error(status: int) -> AcquisitionState:
    if status in {401, 403, 429, 451}:
        return AcquisitionState.BLOCKED
    if status == 402:
        return AcquisitionState.PAYWALLED
    if status in {404, 410}:
        return AcquisitionState.REMOVED
    return AcquisitionState.FAILED


def acquire_article(candidate: DiscoveredArticle) -> NormalizedArticle:
    """Acquire one candidate while preserving partial evidence and diagnostics."""
    started_at = time.monotonic()
    response = None
    try:
        response = request_with_safe_redirects(
            "GET",
            candidate.url,
            headers=HEADERS,
        )
        status = response.status_code
        final_url = getattr(response, "url", None) or candidate.url
        raw_content_type = response.headers.get("Content-Type", "")
        content_type = raw_content_type.split(";", 1)[0].lower()
        if status >= 400:
            response.close()
            return _failure_article(
                candidate,
                state=_state_for_http_error(status),
                reason=f"Remote HTTP status {status}.",
                status=status,
                final_url=final_url,
                content_type=content_type,
                started_at=started_at,
            )
        if content_type and content_type not in SUPPORTED_CONTENT_TYPES:
            response.close()
            return _failure_article(
                candidate,
                state=AcquisitionState.FAILED,
                reason="The target did not return a supported text document.",
                status=status,
                final_url=final_url,
                content_type=content_type,
                started_at=started_at,
            )
        body = read_limited_body(response, MAX_RESPONSE_BYTES)
    except UnsafeURLError:
        return _failure_article(
            candidate,
            state=AcquisitionState.BLOCKED,
            reason="The target was rejected by the public-network boundary.",
            started_at=started_at,
        )
    except ResponseTooLargeError:
        return _failure_article(
            candidate,
            state=AcquisitionState.FAILED,
            reason="The remote response exceeded the size limit.",
            started_at=started_at,
        )
    except SafeRequestError:
        return _failure_article(
            candidate,
            state=AcquisitionState.FAILED,
            reason="The remote server could not be reached safely.",
            started_at=started_at,
        )
    except Exception:
        if response is not None:
            response.close()
        return _failure_article(
            candidate,
            state=AcquisitionState.FAILED,
            reason="Unexpected acquisition failure.",
            started_at=started_at,
        )

    document = _decode_document(body, raw_content_type)
    soup = BeautifulSoup(document, "lxml")
    metadata = parse_metadata(soup)
    canonical_url = choose_canonical_url(
        candidate.url,
        final_url=final_url,
        advertised_url=metadata.canonical_url,
    )
    article_id = stable_article_id(canonical_url)

    paragraphs, method = extract_paragraphs(
        BeautifulSoup(document, "lxml"),
        article_body=metadata.article_body,
    )
    warnings: list[str] = []

    body_characters = sum(len(value) for value in paragraphs)
    rss_paragraphs = _split_supplied_text(candidate.rss_content)
    if body_characters < 500 and sum(map(len, rss_paragraphs)) >= 500:
        paragraphs = rss_paragraphs
        method = ExtractionMethod.RSS_BODY
        body_characters = sum(map(len, paragraphs))
        warnings.append("Direct extraction was replaced by RSS-provided content.")

    if is_google_news_wrapper(candidate.url) and body_characters < 500:
        warnings.append(
            "Google News wrapper did not expose a useful publisher article."
        )

    paywalled = _looks_paywalled(soup)
    if body_characters >= 1_200 and len(paragraphs) >= 4:
        state = AcquisitionState.FULL
    elif body_characters >= 500:
        state = AcquisitionState.PARTIAL
    elif paywalled:
        state = AcquisitionState.PAYWALLED
    elif metadata.title or candidate.title:
        state = AcquisitionState.METADATA_ONLY
    else:
        state = AcquisitionState.FAILED

    metadata_fields = (
        metadata.title or candidate.title,
        metadata.publisher or candidate.publisher,
        metadata.published_at or candidate.published_at,
        metadata.authors,
        metadata.description,
    )
    metadata_score = sum(bool(value) for value in metadata_fields) / len(
        metadata_fields
    )
    body_score = min(1.0, body_characters / 4_000)
    completeness = round((0.8 * body_score) + (0.2 * metadata_score), 3)

    paragraph_models = [
        ArticleParagraph(
            id=f"{article_id}:p{position:03d}",
            position=position,
            text=text,
        )
        for position, text in enumerate(paragraphs, start=1)
    ]
    text = "\n\n".join(paragraphs)

    return NormalizedArticle(
        id=article_id,
        canonical_url=canonical_url,
        original_url=candidate.url,
        discovery_url=candidate.discovery_url,
        resolution_method=candidate.resolution_method,
        resolution_error=candidate.resolution_error,
        publisher=metadata.publisher or candidate.publisher,
        authors=metadata.authors or [],
        title=metadata.title or candidate.title,
        description=metadata.description,
        language=metadata.language or candidate.language,
        country=candidate.country,
        published_at=metadata.published_at or candidate.published_at,
        updated_at=metadata.updated_at,
        fetched_at=datetime.now(UTC),
        extraction_version=EXTRACTION_VERSION,
        paragraphs=paragraph_models,
        quotations=_extract_quotations(soup),
        outbound_links=_extract_links(soup, canonical_url),
        acquisition_state=state,
        extraction_method=method or ExtractionMethod.STRUCTURED_METADATA,
        completeness_score=completeness,
        content_hash=_hash_content(text),
        similarity_hash=_similarity_hash(text),
        discovery_source=candidate.discovery_source,
        diagnostics=AcquisitionDiagnostics(
            http_status=status,
            final_url=final_url,
            content_type=content_type,
            response_bytes=len(body),
            duration_ms=max(
                0,
                round((time.monotonic() - started_at) * 1000),
            ),
            warnings=warnings,
            failure_reason=(
                "No useful article body was extracted."
                if state is AcquisitionState.FAILED
                else None
            ),
        ),
    )
