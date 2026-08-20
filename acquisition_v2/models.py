"""Validated data contracts for acquisition and evidence."""

from __future__ import annotations

from datetime import datetime
from enum import StrEnum

from pydantic import BaseModel, ConfigDict, Field


class DiscoverySource(StrEnum):
    DIRECT_URL = "DIRECT_URL"
    GDELT = "GDELT"
    BRAVE_NEWS = "BRAVE_NEWS"
    LOCAL_METADATA_INDEX = "LOCAL_METADATA_INDEX"
    GOOGLE_NEWS_RSS = "GOOGLE_NEWS_RSS"
    PUBLISHER_RSS = "PUBLISHER_RSS"
    NEWS_SITEMAP = "NEWS_SITEMAP"


class URLResolutionMethod(StrEnum):
    GOOGLE_NEWS_INTERNAL = "GOOGLE_NEWS_INTERNAL"


class AcquisitionState(StrEnum):
    FULL = "FULL"
    PARTIAL = "PARTIAL"
    METADATA_ONLY = "METADATA_ONLY"
    BLOCKED = "BLOCKED"
    PAYWALLED = "PAYWALLED"
    REMOVED = "REMOVED"
    FAILED = "FAILED"


class ExtractionMethod(StrEnum):
    STRUCTURED_METADATA = "STRUCTURED_METADATA"
    HTTP_ARTICLE = "HTTP_ARTICLE"
    JSON_LD_BODY = "JSON_LD_BODY"
    RSS_BODY = "RSS_BODY"
    SYNDICATION_RECOVERY = "SYNDICATION_RECOVERY"


class DiscoveredArticle(BaseModel):
    model_config = ConfigDict(extra="forbid")

    url: str = Field(min_length=8, max_length=2048)
    title: str | None = Field(default=None, max_length=500)
    publisher: str | None = Field(default=None, max_length=200)
    published_at: datetime | None = None
    language: str | None = Field(default=None, max_length=32)
    country: str | None = Field(default=None, max_length=64)
    discovery_source: DiscoverySource
    event_hint: str | None = Field(default=None, max_length=500)
    discovery_url: str | None = Field(default=None, max_length=2048)
    resolution_method: URLResolutionMethod | None = None
    resolution_error: str | None = Field(default=None, max_length=500)

    rss_content: str | None = Field(
        default=None,
        max_length=25_000,
        exclude=True,
        repr=False,
    )


class ArticleParagraph(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: str = Field(pattern=r"^article_[0-9a-f]{16}:p[0-9]{3}$")
    position: int = Field(ge=1)
    text: str = Field(min_length=1, max_length=10_000)


class AcquisitionDiagnostics(BaseModel):
    model_config = ConfigDict(extra="forbid")

    http_status: int | None = Field(default=None, ge=100, le=599)
    final_url: str | None = Field(default=None, max_length=2048)
    content_type: str | None = Field(default=None, max_length=200)
    response_bytes: int = Field(default=0, ge=0)
    duration_ms: int = Field(default=0, ge=0)
    warnings: list[str] = Field(default_factory=list, max_length=20)
    failure_reason: str | None = Field(default=None, max_length=500)


class NormalizedArticle(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: str = Field(pattern=r"^article_[0-9a-f]{16}$")
    canonical_url: str
    original_url: str
    discovery_url: str | None = None
    resolution_method: URLResolutionMethod | None = None
    resolution_error: str | None = None
    publisher: str | None = None
    authors: list[str] = Field(default_factory=list, max_length=20)
    title: str | None = None
    description: str | None = None
    language: str | None = None
    country: str | None = None
    published_at: datetime | None = None
    updated_at: datetime | None = None
    fetched_at: datetime
    extraction_version: str
    paragraphs: list[ArticleParagraph] = Field(default_factory=list)
    quotations: list[str] = Field(default_factory=list, max_length=100)
    outbound_links: list[str] = Field(default_factory=list, max_length=200)
    acquisition_state: AcquisitionState
    extraction_method: ExtractionMethod | None = None
    completeness_score: float = Field(ge=0, le=1)
    content_hash: str | None = Field(
        default=None,
        pattern=r"^[0-9a-f]{64}$",
    )
    similarity_hash: str | None = Field(
        default=None,
        pattern=r"^[0-9a-f]{16}$",
    )
    discovery_source: DiscoverySource
    probable_origin: str | None = None
    lineage_group: str | None = None
    diagnostics: AcquisitionDiagnostics

    @property
    def text(self) -> str:
        return "\n\n".join(paragraph.text for paragraph in self.paragraphs)

    @property
    def useful_for_claims(self) -> bool:
        return (
            self.acquisition_state
            in {
                AcquisitionState.FULL,
                AcquisitionState.PARTIAL,
            }
            and sum(len(paragraph.text) for paragraph in self.paragraphs) >= 500
        )
