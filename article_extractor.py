"""Bounded, IP-pinned article extraction."""

from __future__ import annotations

from bs4 import BeautifulSoup

from url_security import (
    SafeRequestError,
    read_limited_body,
    request_with_safe_redirects,
)

MAX_RESPONSE_BYTES = 2 * 1024 * 1024
MAX_EXTRACTED_CHARACTERS = 25_000
ALLOWED_CONTENT_TYPES = (
    "text/html",
    "application/xhtml+xml",
    "application/xml",
    "text/xml",
    "text/plain",
)
HEADERS = {
    "User-Agent": ("PRISM/1.0 (+https://github.com/Daniele-Cangi/PRISM)"),
    "Accept": (
        "text/html,application/xhtml+xml,application/xml;q=0.9,text/plain;q=0.8"
    ),
}


class ExtractionError(RuntimeError):
    pass


def extract_article(url: str) -> str:
    try:
        response = request_with_safe_redirects(
            "GET",
            url,
            headers=HEADERS,
        )
        response.raise_for_status()
        content_type = (
            response.headers.get(
                "Content-Type",
                "",
            )
            .split(";", 1)[0]
            .lower()
        )
        if content_type and content_type not in ALLOWED_CONTENT_TYPES:
            response.close()
            raise ExtractionError(
                "The target did not return a supported text document."
            )
        body = read_limited_body(
            response,
            MAX_RESPONSE_BYTES,
        )
    except ExtractionError:
        raise
    except SafeRequestError as exc:
        raise ExtractionError("The article could not be retrieved safely.") from exc
    except Exception as exc:
        raise ExtractionError("The article could not be retrieved safely.") from exc

    soup = BeautifulSoup(
        body,
        "html.parser",
    )
    for tag in soup(
        [
            "script",
            "style",
            "noscript",
            "iframe",
            "svg",
            "footer",
            "nav",
            "header",
            "aside",
        ]
    ):
        tag.decompose()

    lines = [
        line.strip()
        for line in soup.get_text(separator="\n").splitlines()
        if len(line.strip()) > 30
    ]
    return "\n".join(lines)[:MAX_EXTRACTED_CHARACTERS]
