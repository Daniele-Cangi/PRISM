"""CLI benchmark runner for the isolated acquisition spike."""

from __future__ import annotations

import argparse
import json
from collections import Counter
from datetime import UTC, datetime
from pathlib import Path

from acquisition_v2.discovery import (
    direct_candidate,
    discover_gdelt,
    discover_google_news,
    discover_rss,
)
from acquisition_v2.lineage import independent_origin_count
from acquisition_v2.manager import AcquisitionManager
from acquisition_v2.models import DiscoveredArticle, NormalizedArticle

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
        choices=("gdelt", "google"),
        help="Discovery adapter; repeat to combine. Query-only defaults to gdelt.",
    )
    parser.add_argument(
        "--country",
        default="US",
        help="Google News two-letter edition code.",
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
        "--output",
        type=Path,
        default=DEFAULT_OUTPUT,
    )
    return parser.parse_args()


def _discover(args: argparse.Namespace) -> tuple[list[DiscoveredArticle], list[str]]:
    sources = args.source or (
        ["gdelt"] if args.query and not args.url and not args.rss else []
    )
    candidates = [direct_candidate(url, event_hint=args.query) for url in args.url]
    errors: list[str] = []

    for source in sources:
        try:
            if source == "gdelt":
                if not args.query:
                    raise ValueError("--query is required for GDELT.")
                candidates.extend(
                    discover_gdelt(
                        args.query,
                        max_records=args.max_candidates,
                    )
                )
            elif source == "google":
                candidates.extend(
                    discover_google_news(
                        country_code=args.country,
                        query=args.query,
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
