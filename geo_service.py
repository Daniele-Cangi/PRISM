"""Google News RSS collection from an allowlist of locales."""

from __future__ import annotations

import feedparser

from url_security import (
    read_limited_body,
    request_with_safe_redirects,
)

GEO_CONFIG = {
    "US": ("en-US", "US", "US:en", "United States"),
    "CA": ("en-CA", "CA", "CA:en", "Canada"),
    "MX": ("es-419", "MX", "MX:es-419", "Mexico"),
    "GB": ("en-GB", "GB", "GB:en", "United Kingdom"),
    "DE": ("de", "DE", "DE:de", "Germany"),
    "FR": ("fr", "FR", "FR:fr", "France"),
    "IT": ("it", "IT", "IT:it", "Italy"),
    "ES": ("es", "ES", "ES:es", "Spain"),
    "NL": ("nl", "NL", "NL:nl", "Netherlands"),
    "BE": ("fr", "BE", "BE:fr", "Belgium"),
    "SE": ("sv", "SE", "SE:sv", "Sweden"),
    "NO": ("no", "NO", "NO:no", "Norway"),
    "PL": ("pl", "PL", "PL:pl", "Poland"),
    "UA": ("uk", "UA", "UA:uk", "Ukraine"),
    "RU": ("ru", "RU", "RU:ru", "Russia"),
    "TR": ("tr", "TR", "TR:tr", "Turkey"),
    "DK": ("da", "DK", "DK:da", "Denmark"),
    "CH": ("de-CH", "CH", "CH:de", "Switzerland"),
    "EE": ("et", "EE", "EE:et", "Estonia"),
    "LV": ("lv", "LV", "LV:lv", "Latvia"),
    "LT": ("lt", "LT", "LT:lt", "Lithuania"),
    "CN": ("zh-CN", "CN", "CN:zh-Hans", "China"),
    "JP": ("ja", "JP", "JP:ja", "Japan"),
    "IN": ("en-IN", "IN", "IN:en", "India"),
    "KR": ("ko", "KR", "KR:ko", "South Korea"),
    "TW": ("zh-TW", "TW", "TW:zh-Hant", "Taiwan"),
    "AU": ("en-AU", "AU", "AU:en", "Australia"),
    "NZ": ("en-NZ", "NZ", "NZ:en", "New Zealand"),
    "ID": ("id", "ID", "ID:id", "Indonesia"),
    "IL": ("he", "IL", "IL:he", "Israel"),
    "SA": ("ar", "SA", "SA:ar", "Saudi Arabia"),
    "AE": ("en-AE", "AE", "AE:en", "UAE"),
    "EG": ("ar", "EG", "EG:ar", "Egypt"),
    "BR": ("pt-BR", "BR", "BR:pt-419", "Brazil"),
    "AR": ("es-419", "AR", "AR:es-419", "Argentina"),
    "CO": ("es-419", "CO", "CO:es-419", "Colombia"),
    "VE": ("es-419", "VE", "VE:es-419", "Venezuela"),
    "ZA": ("en", "ZA", "ZA:en", "South Africa"),
    "NG": ("en", "NG", "NG:en", "Nigeria"),
}


def collect_geo_news(
    country_code: str,
) -> dict:
    code = country_code.strip().upper()
    config = GEO_CONFIG.get(code)
    if not config:
        return {
            "sector": code,
            "status": "SECTOR_UNMAPPED",
            "count": 0,
            "data": [],
        }

    language, country, edition, name = config
    url = f"https://news.google.com/rss?hl={language}&gl={country}&ceid={edition}"
    response = request_with_safe_redirects(
        "GET",
        url,
        headers={"User-Agent": "PRISM-Analyzer/1.0"},
    )
    response.raise_for_status()
    body = read_limited_body(
        response,
        1024 * 1024,
    )

    feed = feedparser.parse(body)
    entries = [
        {
            "title": entry.get(
                "title",
                "Untitled",
            ),
            "source": entry.get(
                "source",
                {},
            ).get(
                "title",
                "Unknown",
            ),
            "published": entry.get(
                "published",
                "N/A",
            ),
            "url": entry.get(
                "link",
                "",
            ),
            "id": entry.get(
                "id",
                entry.get("link", ""),
            ),
        }
        for entry in feed.entries[:10]
    ]
    return {
        "sector": code,
        "sector_name": name,
        "status": "TARGETS_ACQUIRED",
        "count": len(entries),
        "data": entries,
    }
