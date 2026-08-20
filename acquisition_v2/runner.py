"""CLI benchmark runner for the isolated acquisition spike."""

from __future__ import annotations

import argparse
import json
import os
from collections import Counter
from datetime import UTC, datetime
from pathlib import Path

from acquisition_v2.canonical import is_google_news_wrapper
from acquisition_v2.discovery import (
    direct_candidate,
    discover_brave_news,
    discover_gdelt,
    discover_google_news,
    discover_rss,
)
from acquisition_v2.lineage import independent_origin_count
from acquisition_v2.manager import AcquisitionManager
from acquisition_v2.metadata_index import (
    DEFAULT_MAX_AGE_DAYS,
    MetadataIndex,
    RefreshStatus,
)
from acquisition_v2.models import DiscoveredArticle, DiscoverySource, NormalizedArticle

DEFAULT_INDEX = Path(".acquisition_v2/discovery-index.sqlite3")
DEFAULT_REGISTRY = Path(__file__).with_name("source_registry.json")
DEFAULT_OUTPUT = Path(".acquisition_v2/latest-report.json")


def build_benchmark_report(
    candidates: list[DiscoveredArticle],
    articles: list[NormalizedArticle],
    *,
    discovery_errors: list[str] | None = None,
) -> dict:
    useful = [article for article in articles if article.useful_for_claims]
    publishers = {
        article.publisher.casefold() for article in useful if article.publisher
    }
    origins = independent_origin_count(useful)
    criteria = {
        "candidate_count_at_least_10": len(candidates) >= 10,
        "useful_articles_at_least_8": len(useful) >= 8,
        "publishers_at_least_6": len(publishers) >= 6,
        "independent_origins_at_least_4": origins >= 4,
    }
    return {
        "passed": all(criteria.values()),
        "criteria": criteria,
        "candidate_count": len(candidates),
        "article_count": len(articles),
        "useful_article_count": len(useful),
        "publisher_count": len(publishers),
        "independent_origin_count": origins,
        "state_counts": dict(
            Counter(article.acquisition_state.value for article in articles)
        ),
        "discovery_errors": discovery_errors or [],
        "total_acquisition_duration_ms": sum(
            article.diagnostics.duration_ms for article in articles
        ),
    }


def _parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Discover and acquire a bounded event corpus without invoking "
            "the v1 analysis engine."
        )
    )
    parser.add_argument("--query", help="Event query for discovery adapters.")
    parser.add_argument(
        "--source",
        action="append",
        choices=("index", "google", "gdelt", "brave"),
        help="Repeat to combine. Query-only defaults to the free index + Google.",
    )
    parser.add_argument(
        "--country",
        default="US",
        help="Two-letter discovery country code.",
    )
    parser.add_argument(
        "--search-language",
        default="en",
        help="Brave News result language.",
    )
    parser.add_argument(
        "--brave-freshness",
        default="pw",
        help="Brave freshness: pd, pw, pm, py, or YYYY-MM-DDtoYYYY-MM-DD.",
    )
    parser.add_argument(
        "--resolve-google-wrappers",
        action=argparse.BooleanOptionalAction,
        default=True,
        help=(
            "Experimentally resolve Google News wrappers through an undocumented "
            "internal RPC; use --no-resolve-google-wrappers as a kill switch."
        ),
    )
    parser.add_argument(
        "--url",
        action="append",
        default=[],
        help="Direct public article URL; repeat as needed.",
    )
    parser.add_argument(
        "--rss",
        action="append",
        default=[],
        help="Public publisher RSS URL; repeat as needed.",
    )
    parser.add_argument(
        "--max-candidates",
        type=int,
        default=15,
        choices=range(1, 31),
        metavar="1-30",
    )
    parser.add_argument(
        "--max-workers",
        type=int,
        default=4,
        choices=range(1, 9),
        metavar="1-8",
    )
    parser.add_argument(
        "--index-db",
        type=Path,
        default=DEFAULT_INDEX,
        help="Local metadata-only SQLite index.",
    )
    parser.add_argument(
        "--source-registry",
        type=Path,
        default=DEFAULT_REGISTRY,
        help="Versioned RSS/news-sitemap source registry.",
    )
    parser.add_argument(
        "--refresh-index",
        action="store_true",
        help="Poll due registry sources before discovery.",
    )
    parser.add_argument(
        "--force-index-refresh",
        action="store_true",
        help="Ignore source polling intervals; implies --refresh-index.",
    )
    parser.add_argument(
        "--index-max-age-days",
        type=int,
        default=DEFAULT_MAX_AGE_DAYS,
        choices=range(1, 366),
        metavar="1-365",
        help="Maximum metadata age retained and searched.",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=DEFAULT_OUTPUT,
    )
    return parser.parse_args()


def _candidate_sort_key(candidate: DiscoveredArticle) -> tuple[bool, float]:
    published_at = candidate.published_at
    if published_at is None:
        freshness = 0.0
    else:
        if published_at.tzinfo is None:
            published_at = published_at.replace(tzinfo=UTC)
        freshness = -published_at.timestamp()
    return is_google_news_wrapper(candidate.url), freshness


def _discover(args: argparse.Namespace) -> tuple[list[DiscoveredArticle], list[str]]:
    candidates = [direct_candidate(url, event_hint=args.query) for url in args.url]
    errors: list[str] = []
    index: MetadataIndex | None = None

    try:
        index = MetadataIndex(args.index_db)
    except Exception as exc:
        errors.append(f"index: {type(exc).__name__}: {exc}")

    if index is not None:
        try:
            index.prune(max_age_days=args.index_max_age_days)
        except Exception as exc:
            errors.append(f"index-prune: {type(exc).__name__}: {exc}")
        if args.refresh_index or args.force_index_refresh:
            try:
                refresh_results = index.refresh_registry(
                    args.source_registry,
                    force=args.force_index_refresh,
                )
                errors.extend(
                    f"index:{result.source_id}: {result.error}"
                    for result in refresh_results
                    if result.status is RefreshStatus.FAILED
                )
            except Exception as exc:
                errors.append(f"index-refresh: {type(exc).__name__}: {exc}")

    sources = args.source or (
        ["index", "google"] if args.query and not args.url and not args.rss else []
    )
    for source in sources:
        try:
            if source == "index":
                if index is None:
                    raise RuntimeError("The local metadata index is unavailable.")
                if not args.query:
                    raise ValueError("--query is required for index search.")
                candidates.extend(
                    index.search(
                        args.query,
                        max_records=args.max_candidates,
                        max_age_days=args.index_max_age_days,
                    )
                )
            elif source == "google":
                candidates.extend(
                    discover_google_news(
                        country_code=args.country,
                        resolve_wrappers=args.resolve_google_wrappers,
                        query=args.query,
                        max_records=args.max_candidates,
                    )
                )
            elif source == "gdelt":
                if not args.query:
                    raise ValueError("--query is required for GDELT.")
                candidates.extend(
                    discover_gdelt(
                        args.query,
                        max_records=args.max_candidates,
                    )
                )
            elif source == "brave":
                if not args.query:
                    raise ValueError("--query is required for Brave News.")
                api_key = os.environ.get("BRAVE_SEARCH_API_KEY")
                if not api_key:
                    raise ValueError("BRAVE_SEARCH_API_KEY is required for Brave News.")
                candidates.extend(
                    discover_brave_news(
                        args.query,
                        api_key=api_key,
                        country_code=args.country,
                        search_language=args.search_language,
                        freshness=args.brave_freshness,
                        max_records=args.max_candidates,
                    )
                )
        except Exception as exc:
            errors.append(f"{source}: {type(exc).__name__}: {exc}")

    for feed_url in args.rss:
        try:
            candidates.extend(
                discover_rss(
                    feed_url,
                    event_hint=args.query,
                    max_records=args.max_candidates,
                )
            )
        except Exception as exc:
            errors.append(f"rss: {type(exc).__name__}: {exc}")

    candidates = AcquisitionManager.deduplicate_candidates(candidates)
    if index is not None:
        indexable = [
            candidate
            for candidate in candidates
            if candidate.discovery_source is not DiscoverySource.LOCAL_METADATA_INDEX
            and not is_google_news_wrapper(candidate.url)
        ]
        try:
            index.upsert_candidates(indexable)
        except Exception as exc:
            errors.append(f"index-store: {type(exc).__name__}: {exc}")

    candidates.sort(key=_candidate_sort_key)
    return candidates[: args.max_candidates], errors


def main() -> int:
    args = _parse_args()
    candidates, discovery_errors = _discover(args)
    if not candidates:
        summary = {
            "passed": False,
            "candidate_count": 0,
            "discovery_errors": discovery_errors
            or ["No discovery adapter returned candidates."],
        }
        print(json.dumps(summary, indent=2, ensure_ascii=False))
        return 2

    manager = AcquisitionManager(max_workers=args.max_workers)
    articles = manager.acquire_many(candidates)
    report = build_benchmark_report(
        candidates,
        articles,
        discovery_errors=discovery_errors,
    )
    payload = {
        "schema_version": "acquisition-v2-spike-1",
        "generated_at": datetime.now(UTC).isoformat(),
        "query": args.query,
        "report": report,
        "candidates": [candidate.model_dump(mode="json") for candidate in candidates],
        "articles": [article.model_dump(mode="json") for article in articles],
    }

    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(
        json.dumps(payload, indent=2, ensure_ascii=False),
        encoding="utf-8",
    )
    print(
        json.dumps(
            {
                **report,
                "output": str(args.output.resolve()),
            },
            indent=2,
            ensure_ascii=False,
        )
    )
    return 0 if report["passed"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
