"""Bounded acquisition orchestration for a small event corpus."""

from __future__ import annotations

import threading
from concurrent.futures import ThreadPoolExecutor, as_completed
from urllib.parse import urlsplit

from acquisition_v2.canonical import normalise_url
from acquisition_v2.extractor import acquire_article
from acquisition_v2.lineage import assign_lineage
from acquisition_v2.models import DiscoveredArticle, NormalizedArticle


class AcquisitionManager:
    def __init__(
        self,
        *,
        max_workers: int = 4,
        per_host_concurrency: int = 1,
    ) -> None:
        if not 1 <= max_workers <= 8:
            raise ValueError("max_workers must be between 1 and 8.")
        if not 1 <= per_host_concurrency <= 2:
            raise ValueError("per_host_concurrency must be between 1 and 2.")
        self.max_workers = max_workers
        self.per_host_concurrency = per_host_concurrency
        self._host_limits: dict[str, threading.BoundedSemaphore] = {}
        self._host_limits_lock = threading.Lock()

    def _host_limit(self, url: str) -> threading.BoundedSemaphore:
        hostname = (urlsplit(url).hostname or "").lower()
        with self._host_limits_lock:
            return self._host_limits.setdefault(
                hostname,
                threading.BoundedSemaphore(self.per_host_concurrency),
            )

    def _acquire_one(
        self,
        candidate: DiscoveredArticle,
    ) -> NormalizedArticle:
        with self._host_limit(candidate.url):
            return acquire_article(candidate)

    @staticmethod
    def deduplicate_candidates(
        candidates: list[DiscoveredArticle],
    ) -> list[DiscoveredArticle]:
        output: list[DiscoveredArticle] = []
        seen: set[str] = set()
        for candidate in candidates:
            try:
                identity = normalise_url(candidate.url)
            except ValueError:
                identity = candidate.url.strip()
            if identity not in seen:
                seen.add(identity)
                output.append(candidate)
        return output

    def acquire_many(
        self,
        candidates: list[DiscoveredArticle],
    ) -> list[NormalizedArticle]:
        candidates = self.deduplicate_candidates(candidates)
        if not candidates:
            return []

        indexed: dict[object, int] = {}
        results: list[NormalizedArticle | None] = [None] * len(candidates)
        with ThreadPoolExecutor(
            max_workers=min(self.max_workers, len(candidates)),
            thread_name_prefix="prism-acquisition",
        ) as executor:
            for index, candidate in enumerate(candidates):
                future = executor.submit(self._acquire_one, candidate)
                indexed[future] = index
            for future in as_completed(indexed):
                results[indexed[future]] = future.result()

        return assign_lineage([article for article in results if article is not None])
