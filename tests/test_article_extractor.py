from __future__ import annotations

import article_extractor
from article_extractor import extract_article


class FakeResponse:
    def __init__(
        self,
        body: bytes,
        content_type: str = "text/html",
    ):
        self.body = body
        self.headers = {"Content-Type": content_type}
        self.closed = False

    def raise_for_status(self):
        return None

    def close(self):
        self.closed = True


def test_extracts_text_without_scripts(
    monkeypatch,
):
    response = FakeResponse(
        b"""
        <html><body>
          <script>ignore me</script>
          <article>
            This is a sufficiently long article sentence
            that should remain in the extracted result.
          </article>
        </body></html>
        """
    )
    monkeypatch.setattr(
        article_extractor,
        "request_with_safe_redirects",
        lambda *_args, **_kwargs: response,
    )
    monkeypatch.setattr(
        article_extractor,
        "read_limited_body",
        lambda *_args: response.body,
    )

    text = extract_article("https://example.com/article")
    assert "sufficiently long" in text
    assert "ignore me" not in text


def test_rejects_non_text_content(
    monkeypatch,
):
    response = FakeResponse(
        b"%PDF",
        "application/pdf",
    )
    monkeypatch.setattr(
        article_extractor,
        "request_with_safe_redirects",
        lambda *_args, **_kwargs: response,
    )

    try:
        extract_article("https://example.com/file.pdf")
    except article_extractor.ExtractionError:
        pass
    else:
        raise AssertionError("Expected ExtractionError")
    assert response.closed
