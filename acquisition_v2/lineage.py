"""Deterministic first-pass syndication grouping."""

from __future__ import annotations

import hashlib
import re
from datetime import UTC, datetime

from acquisition_v2.models import NormalizedArticle

NEAR_DUPLICATE_THRESHOLD = 0.82


def _shingles(text: str, size: int = 5) -> set[tuple[str, ...]]:
    words = re.findall(r"[^\W_]+", text.casefold(), flags=re.UNICODE)
    if len(words) < size:
        return {tuple(words)} if words else set()
    return {
        tuple(words[index : index + size]) for index in range(len(words) - size + 1)
    }


def text_similarity(left: str, right: str) -> float:
    left_shingles = _shingles(left)
    right_shingles = _shingles(right)
    if not left_shingles or not right_shingles:
        return 0
    return len(left_shingles & right_shingles) / len(left_shingles | right_shingles)


def _same_lineage(left: NormalizedArticle, right: NormalizedArticle) -> bool:
    if (
        left.content_hash
        and right.content_hash
        and left.content_hash == right.content_hash
    ):
        return True
    return text_similarity(left.text, right.text) >= NEAR_DUPLICATE_THRESHOLD


def _origin_sort_key(article: NormalizedArticle) -> tuple[datetime, str]:
    when = article.published_at or article.fetched_at
    if when.tzinfo is None:
        when = when.replace(tzinfo=UTC)
    return when, article.id


def assign_lineage(
    articles: list[NormalizedArticle],
) -> list[NormalizedArticle]:
    """Group exact and near duplicates without claiming editorial causality."""
    parents = list(range(len(articles)))

    def find(index: int) -> int:
        while parents[index] != index:
            parents[index] = parents[parents[index]]
            index = parents[index]
        return index

    def union(left: int, right: int) -> None:
        left_root = find(left)
        right_root = find(right)
        if left_root != right_root:
            parents[right_root] = left_root

    for left in range(len(articles)):
        if not articles[left].text:
            continue
        for right in range(left + 1, len(articles)):
            if articles[right].text and _same_lineage(
                articles[left],
                articles[right],
            ):
                union(left, right)

    groups: dict[int, list[int]] = {}
    for index in range(len(articles)):
        groups.setdefault(find(index), []).append(index)

    updated = list(articles)
    for indexes in groups.values():
        identities = sorted(articles[index].id for index in indexes)
        digest = hashlib.sha256("|".join(identities).encode("utf-8")).hexdigest()
        group_id = f"lineage_{digest[:12]}"
        origin = min(
            (articles[index] for index in indexes),
            key=_origin_sort_key,
        )
        probable_origin = origin.publisher or origin.canonical_url
        for index in indexes:
            updated[index] = articles[index].model_copy(
                update={
                    "lineage_group": group_id,
                    "probable_origin": probable_origin,
                }
            )
    return updated


def independent_origin_count(articles: list[NormalizedArticle]) -> int:
    values = {
        article.lineage_group or article.id
        for article in articles
        if article.useful_for_claims
    }
    return len(values)
