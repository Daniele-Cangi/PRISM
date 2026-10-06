from __future__ import annotations

import json

import httpx2
import pytest
from openai import OpenAI

import analysis_engine


@pytest.mark.parametrize("content", ["valid", "invalid", "empty"])
def test_analysis_contract_with_real_sdk(monkeypatch, content):
    result = {
        "title": "A test article",
        "meta": {"score": 20, "verdict_short": "Neutral", "tone": "Informative"},
        "intent": "Inform the reader",
        "narrative_analysis": "The article describes an event.",
        "facts": ["An event occurred"],
        "axioms": ["The account requires verification"],
    }
    if content == "invalid":
        result["meta"]["score"] = 101
    message = None if content == "empty" else json.dumps(result)

    def respond(request):
        assert request.method == "POST"
        assert request.url.path == "/v1/chat/completions"
        payload = json.loads(request.content)
        assert payload["response_format"] == {"type": "json_object"}
        assert "<untrusted_article>" in payload["messages"][1]["content"]
        assert "Example article" in payload["messages"][1]["content"]
        return httpx2.Response(
            200,
            json={
                "id": "test-completion",
                "object": "chat.completion",
                "created": 0,
                "model": "test-model",
                "choices": [
                    {
                        "index": 0,
                        "message": {"role": "assistant", "content": message},
                        "finish_reason": "stop",
                    }
                ],
            },
        )

    monkeypatch.setenv("OPENAI_API_KEY", "not-a-real-key")
    with httpx2.Client(transport=httpx2.MockTransport(respond)) as transport:
        with OpenAI(api_key="not-a-real-key", http_client=transport) as client:
            monkeypatch.setattr(analysis_engine, "OpenAI", lambda **_kwargs: client)
            if content == "valid":
                assert analysis_engine.analyze_article("Example article") == result
            else:
                with pytest.raises(analysis_engine.AnalysisEngineError):
                    analysis_engine.analyze_article("Example article")
