from __future__ import annotations

import hashlib
import json
from datetime import UTC, datetime

import pytest

import acquisition_v2.discovery as discovery
import acquisition_v2.extractor as extractor
import acquisition_v2.google_resolver as google_resolver
import acquisition_v2.manager as manager_module
from acquisition_v2.canonical import (
    choose_canonical_url,
    is_google_news_wrapper,
    normalise_url,
    stable_article_id,
)
from acquisition_v2.discovery import (
    direct_candidate,
    discover_brave_news,
    discover_gdelt,
    discover_google_news,
    discover_rss,
)
from acquisition_v2.extractor import acquire_article
from acquisition_v2.lineage import (
    assign_lineage,
    independent_origin_count,
    text_similarity,
)
from acquisition_v2.manager import AcquisitionManager
from acquisition_v2.models import (
    AcquisitionDiagnostics,
    AcquisitionState,
    ArticleParagraph,
    DiscoveredArticle,
    DiscoverySource,
    ExtractionMethod,
    NormalizedArticle,
    URLResolutionMethod,
)
from acquisition_v2.runner import build_benchmark_report


class FakeResponse:
    def __init__(
        self,
        body: bytes = b"",
        *,
        status: int = 200,
        content_type: str = "text/html",
        url: str = "https://example.com/story",
    ):
        self.body = body
        self.status_code = status
        self.headers = {"Content-Type": content_type}
        self.url = url
        self.closed = False

    def close(self):
        self.closed = True

    def raise_for_status(self):
        if self.status_code >= 400:
            self.close()
            raise RuntimeError("HTTP error")


def _candidate(
    url: str = "https://example.com/story",
    **updates,
) -> DiscoveredArticle:
    values = {
        "url": url,
        "title": "Discovered title",
        "publisher": "Example News",
        "discovery_source": DiscoverySource.DIRECT_URL,
        "event_hint": "test event",
    }
    values.update(updates)
    return DiscoveredArticle(**values)


def _patch_fetch(monkeypatch, response: FakeResponse):
    monkeypatch.setattr(
        extractor,
        "request_with_safe_redirects",
        lambda *_args, **_kwargs: response,
    )
    monkeypatch.setattr(
        extractor,
        "read_limited_body",
        lambda current, _limit: current.body,
    )


def _article(
    index: int,
    *,
    text: str,
    publisher: str | None = None,
    lineage_group: str | None = None,
) -> NormalizedArticle:
    url = f"https://source{index}.example/story"
    article_id = stable_article_id(url)
    paragraph = ArticleParagraph(
        id=f"{article_id}:p001",
        position=1,
        text=text,
    )
    normalized = " ".join(text.split()).casefold()
    return NormalizedArticle(
        id=article_id,
        canonical_url=url,
        original_url=url,
        publisher=publisher or f"Publisher {index}",
        fetched_at=datetime.now(UTC),
        extraction_version="test",
        paragraphs=[paragraph],
        acquisition_state=AcquisitionState.PARTIAL,
        extraction_method=ExtractionMethod.HTTP_ARTICLE,
        completeness_score=0.7,
        content_hash=hashlib.sha256(normalized.encode()).hexdigest(),
        similarity_hash="0123456789abcdef",
        discovery_source=DiscoverySource.DIRECT_URL,
        lineage_group=lineage_group,
        diagnostics=AcquisitionDiagnostics(),
    )


def test_normalise_url_removes_tracking_and_sorts_query():
    assert (
        normalise_url("HTTPS://Example.COM:443/a?utm_source=x&b=2&a=1#section")
        == "https://example.com/a?a=1&b=2"
    )


def test_canonical_url_rejects_cross_site_metadata():
    assert (
        choose_canonical_url(
            "https://example.com/start",
            final_url="https://www.example.com/story?utm_source=x",
            advertised_url="https://attacker.example/internal",
        )
        == "https://www.example.com/story"
    )


def test_stable_identity_and_google_wrapper_detection():
    left = stable_article_id("https://example.com/a?utm_source=one")
    right = stable_article_id("https://example.com/a?utm_source=two")
    assert left == right
    assert is_google_news_wrapper("https://news.google.com/rss/articles/abc?oc=5")
    assert not is_google_news_wrapper("https://example.com/rss/articles/abc")


def test_acquires_structured_full_article(monkeypatch):
    paragraph = (
        "Officials described a detailed sequence of events and provided "
        "specific timings, locations, witnesses, and attributed statements. "
    ) * 4
    html = f"""
    <html lang="en">
      <head>
        <link rel="canonical" href="https://example.com/story?utm_source=feed">
        <script type="application/ld+json">
          {{
            "@context": "https://schema.org",
            "@type": "NewsArticle",
            "headline": "A structured headline",
            "description": "A useful description",
            "datePublished": "2026-08-19T10:00:00Z",
            "dateModified": "2026-08-19T11:00:00Z",
            "author": [{{"name": "Ada Reporter"}}],
            "publisher": {{"name": "Example News"}}
          }}
        </script>
      </head>
      <body>
        <nav>Navigation that must not become evidence.</nav>
        <article>
          <p>{paragraph} One.</p>
          <p>{paragraph} Two.</p>
          <p>{paragraph} Three.</p>
          <p>{paragraph} Four.</p>
          <blockquote>An attributed quotation that should be retained.</blockquote>
          <a href="/related?utm_campaign=test">Related report</a>
        </article>
      </body>
    </html>
    """.encode()
    response = FakeResponse(html)
    _patch_fetch(monkeypatch, response)

    article = acquire_article(_candidate())

    assert article.acquisition_state is AcquisitionState.FULL
    assert article.extraction_method is ExtractionMethod.HTTP_ARTICLE
    assert article.canonical_url == "https://example.com/story"
    assert article.title == "A structured headline"
    assert article.authors == ["Ada Reporter"]
    assert len(article.paragraphs) == 4
    assert article.paragraphs[0].id == f"{article.id}:p001"
    assert article.content_hash
    assert article.similarity_hash
    assert article.quotations
    assert "https://example.com/related" in article.outbound_links
    assert "Navigation" not in article.text


def test_respects_declared_http_charset(monkeypatch):
    title = "Difesa: il Paese sfida l'unit\u00e0 europea"
    paragraph = (
        "La citt\u00e0 \u00e8 al centro di un'analisi attribuita e verificabile. " * 12
    )
    html = (
        f"<html><head><title>{title}</title></head>"
        f"<article><p>{paragraph}</p></article></html>"
    )

    _patch_fetch(
        monkeypatch,
        FakeResponse(html.encode("utf-8"), content_type="text/html; charset=utf-8"),
    )
    article = acquire_article(_candidate())

    assert article.title == title
    assert "citt\u00e0" in article.text


def test_uses_json_ld_body_when_page_has_no_paragraphs(monkeypatch):
    body_text = (
        "This JSON LD body contains enough attributed reporting and context "
        "to be a useful partial representation of the article. "
    ) * 8
    html = f"""
    <html><head><script type="application/ld+json">
      {{
        "@type": "NewsArticle",
        "headline": "Metadata body",
        "articleBody": {json.dumps(body_text)}
      }}
    </script></head><body><div id="app"></div></body></html>
    """.encode()
    _patch_fetch(monkeypatch, FakeResponse(html))

    article = acquire_article(_candidate())

    assert article.acquisition_state is AcquisitionState.PARTIAL
    assert article.extraction_method is ExtractionMethod.JSON_LD_BODY
    assert body_text[:100] in article.text


def test_rss_body_recovers_failed_direct_extraction(monkeypatch):
    rss_text = (
        "The publisher feed contains a sufficiently detailed report with "
        "dates, attribution, context, and several independently useful facts. "
    ) * 8
    _patch_fetch(
        monkeypatch,
        FakeResponse(b"<html><head><title>Shell</title></head><body></body></html>"),
    )
    candidate = _candidate(
        discovery_source=DiscoverySource.PUBLISHER_RSS,
        rss_content=rss_text,
    )

    article = acquire_article(candidate)

    assert article.acquisition_state is AcquisitionState.PARTIAL
    assert article.extraction_method is ExtractionMethod.RSS_BODY
    assert "RSS-provided" in article.diagnostics.warnings[0]


def test_google_wrapper_remains_explicitly_metadata_only(monkeypatch):
    url = "https://news.google.com/rss/articles/abc?oc=5"
    _patch_fetch(
        monkeypatch,
        FakeResponse(
            b"<html><head><title>Google News</title></head><body></body></html>",
            url=url,
        ),
    )

    article = acquire_article(
        _candidate(
            url,
            discovery_source=DiscoverySource.GOOGLE_NEWS_RSS,
        )
    )

    assert article.acquisition_state is AcquisitionState.METADATA_ONLY
    assert any("wrapper" in warning.lower() for warning in article.diagnostics.warnings)


@pytest.mark.parametrize(
    ("status", "state"),
    [
        (403, AcquisitionState.BLOCKED),
        (404, AcquisitionState.REMOVED),
        (410, AcquisitionState.REMOVED),
        (429, AcquisitionState.BLOCKED),
    ],
)
def test_classifies_http_failures(monkeypatch, status, state):
    response = FakeResponse(status=status)
    _patch_fetch(monkeypatch, response)

    article = acquire_article(_candidate())

    assert article.acquisition_state is state
    assert article.diagnostics.http_status == status
    assert response.closed


def test_detects_paywall_marker(monkeypatch):
    html = b"""
    <html><head><title>Subscriber story</title></head>
    <body><div class="hard-paywall">Subscribe to continue reading.</div></body>
    </html>
    """
    _patch_fetch(monkeypatch, FakeResponse(html))

    article = acquire_article(_candidate())

    assert article.acquisition_state is AcquisitionState.PAYWALLED


def test_resolves_google_wrapper_through_bounded_rpc(monkeypatch):
    token = "A" * 32
    wrapper = f"https://news.google.com/rss/articles/{token}?oc=5"
    direct = "https://publisher.example/story?utm_source=google"
    wrapper_html = (
        b'<html><c-wiz><div jscontroller="x" '
        b'data-n-a-sg="signature_123" data-n-a-ts="12345678"></div>'
        b"</c-wiz></html>"
    )
    batch_payload = (
        ")]}'\n\n"
        + json.dumps([["wrb.fr", "Fbv4je", json.dumps(["garturlres", direct])]])
    ).encode()
    responses = [
        FakeResponse(wrapper_html, url=wrapper),
        FakeResponse(batch_payload, content_type="application/json"),
    ]
    calls = []

    def fake_request(method, url, **kwargs):
        calls.append((method, url, kwargs))
        return responses.pop(0)

    monkeypatch.setattr(google_resolver, "request_with_safe_redirects", fake_request)
    monkeypatch.setattr(
        google_resolver,
        "read_limited_body",
        lambda response, _limit: response.body,
    )

    resolved = google_resolver.resolve_google_news_url(wrapper)

    assert resolved == "https://publisher.example/story"
    assert calls[0][0] == "GET"
    assert calls[1][0] == "POST"
    assert calls[1][2]["max_redirects"] == 0
    assert len(calls[1][2]["body"]) < 4_096


def test_google_wrapper_resolver_rejects_missing_parameters(monkeypatch):
    wrapper = f"https://news.google.com/rss/articles/{'A' * 32}?oc=5"
    response = FakeResponse(b"<html><body>No parameters</body></html>", url=wrapper)
    monkeypatch.setattr(
        google_resolver,
        "request_with_safe_redirects",
        lambda *_args, **_kwargs: response,
    )
    monkeypatch.setattr(
        google_resolver,
        "read_limited_body",
        lambda current, _limit: current.body,
    )

    with pytest.raises(
        google_resolver.GoogleNewsResolutionError,
        match="did not expose",
    ):
        google_resolver.resolve_google_news_url(wrapper)


def test_discovers_gdelt_direct_urls(monkeypatch):
    payload = {
        "articles": [
            {
                "url": "https://publisher.example/story",
                "title": "International event",
                "domain": "publisher.example",
                "seendate": "20260819T120000Z",
                "language": "Italian",
                "sourcecountry": "Italy",
            }
        ]
    }
    monkeypatch.setattr(
        discovery,
        "_fetch",
        lambda _url: json.dumps(payload).encode(),
    )

    candidates = discover_gdelt("international event")

    assert len(candidates) == 1
    assert candidates[0].publisher == "publisher.example"
    assert candidates[0].country == "Italy"
    assert candidates[0].discovery_source is DiscoverySource.GDELT


def test_discovers_brave_direct_urls_without_exposing_key(monkeypatch):
    payload = {
        "results": [
            {
                "url": "https://publisher.example/brave-story",
                "title": "Direct Brave result",
                "page_age": "2026-08-19T12:00:00Z",
                "meta_url": {"hostname": "publisher.example"},
            }
        ]
    }
    captured = {}

    def fake_fetch(url, *, headers=None):
        captured["url"] = url
        captured["headers"] = headers
        return json.dumps(payload).encode()

    monkeypatch.setattr(discovery, "_fetch", fake_fetch)

    candidates = discover_brave_news(
        "international event",
        api_key="test-secret",
        country_code="IT",
        search_language="it",
    )

    assert len(candidates) == 1
    assert candidates[0].url == "https://publisher.example/brave-story"
    assert candidates[0].discovery_source is DiscoverySource.BRAVE_NEWS
    assert "q=international+event" in captured["url"]
    assert captured["headers"]["X-Subscription-Token"] == "test-secret"
    assert "test-secret" not in captured["url"]


def test_rejects_invalid_gdelt_query():
    with pytest.raises(ValueError):
        discover_gdelt("x")


def test_discovery_reports_endpoint_http_status(monkeypatch):
    monkeypatch.setattr(
        discovery,
        "request_with_safe_redirects",
        lambda *_args, **_kwargs: FakeResponse(status=429),
    )

    with pytest.raises(discovery.DiscoveryError, match="HTTP 429"):
        discovery._fetch("https://api.gdeltproject.org/test")


def test_discovers_google_news_and_preserves_metadata(monkeypatch):
    rss = b"""
    <rss version="2.0"><channel><title>Google News</title>
      <item>
        <title>Same event - Publisher</title>
        <link>https://news.google.com/rss/articles/abc?oc=5</link>
        <pubDate>Wed, 19 Aug 2026 12:00:00 GMT</pubDate>
        <source>Publisher</source>
        <description>A short feed description.</description>
      </item>
    </channel></rss>
    """
    monkeypatch.setattr(discovery, "_fetch", lambda _url: rss)

    candidates = discover_google_news(
        country_code="IT",
        query="same event",
    )

    assert len(candidates) == 1
    assert candidates[0].publisher == "Publisher"
    assert candidates[0].country == "IT"
    assert candidates[0].event_hint == "same event"


def test_google_discovery_resolves_wrappers_with_provenance(monkeypatch):
    token = "A" * 32
    wrapper = f"https://news.google.com/rss/articles/{token}?oc=5"
    rss = f"""
    <rss version="2.0"><channel><title>Google News</title>
      <item>
        <title>Resolved event - Publisher</title>
        <link>{wrapper}</link>
        <source>Publisher</source>
      </item>
    </channel></rss>
    """.encode()
    direct = "https://publisher.example/resolved-story"
    monkeypatch.setattr(discovery, "_fetch", lambda _url: rss)
    monkeypatch.setattr(discovery, "resolve_google_news_url", lambda _url: direct)

    candidates = discover_google_news(
        country_code="US",
        query="resolved event",
        resolve_wrappers=True,
    )

    assert len(candidates) == 1
    assert candidates[0].url == direct
    assert candidates[0].discovery_url == wrapper
    assert candidates[0].resolution_method is URLResolutionMethod.GOOGLE_NEWS_INTERNAL
    assert candidates[0].resolution_error is None


def test_discovers_publisher_rss_content(monkeypatch):
    rss = b"""
    <rss version="2.0"><channel><title>Publisher Feed</title>
      <item>
        <title>Feed story</title>
        <link>https://publisher.example/feed-story</link>
        <description><![CDATA[
          <p>A feed body with useful context and attributed reporting.</p>
        ]]></description>
      </item>
    </channel></rss>
    """
    monkeypatch.setattr(discovery, "_fetch", lambda _url: rss)

    candidates = discover_rss("https://publisher.example/rss")

    assert candidates[0].publisher == "Publisher Feed"
    assert candidates[0].rss_content
    assert "rss_content" not in candidates[0].model_dump()


def test_direct_candidate_contract():
    candidate = direct_candidate(
        "https://example.com/story",
        event_hint="event",
    )
    assert candidate.discovery_source is DiscoverySource.DIRECT_URL


def test_lineage_groups_duplicates_and_keeps_independent_article():
    repeated = (
        "A long syndicated report repeats the same sequence of attributed "
        "facts and contextual details across several publisher websites. "
    ) * 6
    unique = (
        "Local witnesses provided a different independent account with new "
        "details, geography, timing, and direct observations from the scene. "
    ) * 6
    articles = [
        _article(1, text=repeated, publisher="Origin Wire"),
        _article(2, text=repeated, publisher="Republisher"),
        _article(3, text=unique, publisher="Local News"),
    ]

    grouped = assign_lineage(articles)

    assert grouped[0].lineage_group == grouped[1].lineage_group
    assert grouped[0].lineage_group != grouped[2].lineage_group
    assert grouped[0].probable_origin == "Origin Wire"
    assert independent_origin_count(grouped) == 2
    assert text_similarity(repeated, repeated) == 1


def test_manager_deduplicates_and_preserves_input_order(monkeypatch):
    candidates = [
        _candidate("https://example.com/a?utm_source=one"),
        _candidate("https://example.com/a?utm_source=two"),
        _candidate("https://other.example/b"),
    ]

    def fake_acquire(candidate):
        index = 1 if "example.com/a" in candidate.url else 2
        return _article(index, text=("Useful evidence text. " * 40))

    monkeypatch.setattr(manager_module, "acquire_article", fake_acquire)
    articles = AcquisitionManager(max_workers=2).acquire_many(candidates)

    assert len(articles) == 2
    assert articles[0].canonical_url.endswith("source1.example/story")
    assert articles[1].canonical_url.endswith("source2.example/story")


def test_benchmark_report_enforces_all_kill_gate_dimensions():
    candidates = [
        _candidate(f"https://candidate{index}.example/story") for index in range(10)
    ]
    text = (
        "A useful evidence paragraph contains attribution, dates, context, "
        "named entities, and enough detail for claim extraction. "
    ) * 6
    articles = [
        _article(
            index,
            text=text + str(index),
            publisher=f"Publisher {index % 6}",
            lineage_group=f"lineage_{index % 4}",
        )
        for index in range(8)
    ]

    report = build_benchmark_report(candidates, articles)

    assert report["passed"]
    assert report["useful_article_count"] == 8
    assert report["publisher_count"] == 6
    assert report["independent_origin_count"] == 4
