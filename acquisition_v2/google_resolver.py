"""Experimental resolver for Google News RSS wrapper URLs.

The protocol is undocumented and intentionally isolated. Callers must preserve the
wrapper URL and treat resolution failures as expected provider failures.
"""

from __future__ import annotations

import json
import re
from urllib.parse import urlencode, urlsplit

from bs4 import BeautifulSoup

from acquisition_v2.canonical import is_google_news_wrapper, normalise_url
from url_security import read_limited_body, request_with_safe_redirects

GOOGLE_BATCH_URL = "https://news.google.com/_/DotsSplashUi/data/batchexecute"
MAX_WRAPPER_BYTES = 1024 * 1024
MAX_BATCH_BYTES = 64 * 1024
TOKEN_PATTERN = re.compile(r"^[A-Za-z0-9_-]{16,1800}$")
SIGNATURE_PATTERN = re.compile(r"^[A-Za-z0-9_-]{8,512}$")
TIMESTAMP_PATTERN = re.compile(r"^[0-9]{8,20}$")
GET_HEADERS = {
    "User-Agent": (
        "PRISM-Acquisition-Spike/2.0 "
        "(+https://github.com/Daniele-Cangi/SHADOW-ANALYZER)"
    ),
    "Accept": "text/html,application/xhtml+xml",
}
POST_HEADERS = {
    **GET_HEADERS,
    "Accept": "application/json,text/plain,*/*",
    "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
}


class GoogleNewsResolutionError(RuntimeError):
    pass


def _read_success(response, max_bytes: int) -> bytes:
    if response.status_code >= 400:
        status = response.status_code
        response.close()
        raise GoogleNewsResolutionError(f"Google News resolver returned HTTP {status}.")
    return read_limited_body(response, max_bytes)


def _wrapper_token(wrapper_url: str) -> str:
    if not is_google_news_wrapper(wrapper_url):
        raise GoogleNewsResolutionError("The URL is not a Google News RSS wrapper.")
    token = urlsplit(wrapper_url).path.rstrip("/").rsplit("/", 1)[-1]
    if not TOKEN_PATTERN.fullmatch(token):
        raise GoogleNewsResolutionError("The Google News wrapper token is malformed.")
    return token


def _decoding_parameters(wrapper_url: str) -> tuple[str, int]:
    response = request_with_safe_redirects(
        "GET",
        wrapper_url,
        headers=GET_HEADERS,
        timeout=(10.0, 30.0),
    )
    document = _read_success(response, MAX_WRAPPER_BYTES).decode(
        "utf-8",
        errors="replace",
    )
    node = BeautifulSoup(document, "lxml").select_one("[data-n-a-sg][data-n-a-ts]")
    if node is None:
        raise GoogleNewsResolutionError(
            "Google News did not expose wrapper resolution parameters."
        )

    signature = node.get("data-n-a-sg") or ""
    timestamp = node.get("data-n-a-ts") or ""
    if not SIGNATURE_PATTERN.fullmatch(signature):
        raise GoogleNewsResolutionError("The Google News signature is malformed.")
    if not TIMESTAMP_PATTERN.fullmatch(timestamp):
        raise GoogleNewsResolutionError("The Google News timestamp is malformed.")
    return signature, int(timestamp)


def _form_body(token: str, signature: str, timestamp: int) -> bytes:
    request = [
        "garturlreq",
        [
            [
                "X",
                "X",
                ["X", "X"],
                None,
                None,
                1,
                1,
                "US:en",
                None,
                1,
                None,
                None,
                None,
                None,
                None,
                0,
                1,
            ],
            "X",
            "X",
            1,
            [1, 1, 1],
            1,
            1,
            None,
            0,
            0,
            None,
            0,
        ],
        token,
        timestamp,
        signature,
    ]
    rpc = ["Fbv4je", json.dumps(request, separators=(",", ":"))]
    encoded = json.dumps([[rpc]], separators=(",", ":"))
    return urlencode({"f.req": encoded}).encode("ascii")


def _decoded_url(body: bytes) -> str:
    text = body.decode("utf-8", errors="strict")
    payload_text = text.split("\n\n", 1)[-1]
    try:
        rows = json.loads(payload_text)
    except json.JSONDecodeError as exc:
        raise GoogleNewsResolutionError(
            "Google News returned an invalid resolver response."
        ) from exc

    for row in rows if isinstance(rows, list) else []:
        if not isinstance(row, list) or len(row) < 3 or not isinstance(row[2], str):
            continue
        try:
            decoded = json.loads(row[2])
        except json.JSONDecodeError:
            continue
        if not isinstance(decoded, list) or len(decoded) < 2:
            continue
        direct_url = decoded[1]
        if not isinstance(direct_url, str):
            continue
        try:
            normalized = normalise_url(direct_url)
        except ValueError:
            continue
        if not is_google_news_wrapper(normalized):
            return normalized

    raise GoogleNewsResolutionError(
        "Google News did not return a direct publisher URL."
    )


def resolve_google_news_url(wrapper_url: str) -> str:
    """Resolve one wrapper through Google's internal RPC, with bounded I/O."""
    try:
        token = _wrapper_token(wrapper_url)
        signature, timestamp = _decoding_parameters(wrapper_url)
        response = request_with_safe_redirects(
            "POST",
            GOOGLE_BATCH_URL,
            headers=POST_HEADERS,
            body=_form_body(token, signature, timestamp),
            timeout=(10.0, 30.0),
            max_redirects=0,
        )
        return _decoded_url(_read_success(response, MAX_BATCH_BYTES))
    except GoogleNewsResolutionError:
        raise
    except Exception as exc:
        raise GoogleNewsResolutionError(
            "Google News wrapper resolution failed safely."
        ) from exc
