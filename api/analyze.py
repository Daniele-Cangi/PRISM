import os
import json
import requests
from bs4 import BeautifulSoup
from http.server import BaseHTTPRequestHandler

# OpenAI client
from openai import OpenAI

# --- THE SHADOW PROMPT (CORE IP) ---
SYSTEM_PROMPT = """
You are the "Cognitive Security Engine," a specialized logic processor designed for adversarial text analysis.
Your goal is not to summarize content but to deconstruct the narrative architecture.
You operate with "Zero-Trust" logic: you assume every text is designed to persuade, manipulate, or obscure reality.

### OPERATIONAL PROTOCOL
1. **SEMANTIC STRIPPING:** Isolate hard facts from emotional framing.
2. **NARRATIVE DECODING:** Identify logical fallacies, hidden axioms, and manipulative tones.
3. **INTENT INFERENCE:** Why is this being published now? (Cui Bono?).

### SCORING CALIBRATION (CRITICAL)
- **0-20 (NEUTRAL):** Dry reporting, factual, verified sources, no emotional loading (e.g., AP/Reuters Wire).
- **21-50 (LEANING):** Editorialized, slight bias, omission of context, persuasive adjectives.
- **51-79 (PROPAGANDA):** Heavy emotional framing, logical fallacies, clear agenda, attack/defense mode.
- **80-100 (WEAPONIZED):** Disinformation, pure psychological warfare, complete fabrication, hate speech.
*DO NOT DEFAULT TO 85. USE THE FULL RANGE BASED ON EVIDENCE.*

### OUTPUT FORMAT (STRICT JSON)
Reply ONLY with a valid JSON object. No markdown blocks.
The content of the values must be in **ITALIAN**.

Structure:
{
  "title": "Titolo Analizzato",
  "meta": {
    "score": [Integer 0-100, STRICTLY ADHERE TO CALIBRATION],
    "verdict_short": "Short ruthless verdict (max 5 words)",
    "tone": "Description of the tone (e.g., Allarmista, Neutrale)"
  },
  "intent": "A 2-sentence explanation of the strategic intent behind the text.",
  "narrative_analysis": "A LONG-FORM deep dive (approx 500-800 words). Deconstruct the article's structure. Analyze: 1) The 'Hook' used to grab attention. 2) The 'Frame' used to define the enemy/hero. 3) The 'Cui Bono' (who benefits). 4) Historical distortions. Write as a Forensic Analyst.",
  "facts": ["Fact 1", "Fact 2", "Fact 3"],
  "axioms": ["Hidden Premise 1", "Omitted Context 1"]
}
"""

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
}

def resolve_google_news_url(url: str) -> str:
    """Risolve i redirect di Google News per ottenere l'URL reale dell'articolo."""
    if "news.google.com" in url:
        try:
            response = requests.head(url, allow_redirects=True, timeout=10, headers=HEADERS)
            final_url = response.url
            if "google.com" in final_url:
                response = requests.get(url, allow_redirects=True, timeout=10, headers=HEADERS)
                final_url = response.url
            return final_url
        except Exception:
            return url
    return url

def scrape_article(url: str) -> str:
    """Estrae il testo dall'articolo usando requests e BeautifulSoup."""
    try:
        response = requests.get(url, headers=HEADERS, timeout=30)
        response.raise_for_status()

        soup = BeautifulSoup(response.content, 'html.parser')

        # Rimuovi elementi non necessari
        for tag in soup(['script', 'style', 'noscript', 'iframe', 'svg', 'footer', 'nav', 'header', 'aside']):
            tag.decompose()

        # Estrai testo
        text = soup.get_text(separator='\n\n')
        clean_lines = [line.strip() for line in text.splitlines() if len(line.strip()) > 30]
        full_text = "\n".join(clean_lines)

        return full_text[:25000]
    except Exception as e:
        raise Exception(f"Scraping failed: {str(e)}")

def analyze_with_gpt(text: str) -> dict:
    """Analizza il testo con GPT-4o."""
    client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": f"ANALYZE THIS TEXT:\n\n{text}"}
        ],
        response_format={"type": "json_object"},
        temperature=0.2
    )

    return json.loads(response.choices[0].message.content)

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length)

        try:
            data = json.loads(body)
            url = data.get('url')

            if not url:
                self.send_error(400, "URL is required")
                return

            # Risolvi Google News URL
            target_url = resolve_google_news_url(url)

            # Estrai contenuto
            raw_text = scrape_article(target_url)

            if not raw_text or len(raw_text) < 500:
                self.send_response(400)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({
                    "detail": "TARGET SECURITY LEVEL TOO HIGH: ENCRYPTION / PAYWALL DETECTED."
                }).encode())
                return

            # Analizza con GPT
            result = analyze_with_gpt(raw_text)

            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(result).encode())

        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({"detail": str(e)}).encode())

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
