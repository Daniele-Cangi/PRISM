import os
import uvicorn
import requests
from bs4 import BeautifulSoup
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI
from dotenv import load_dotenv

# --- CONFIGURAZIONE ---
load_dotenv() # Carica OPENAI_API_KEY dal file .env
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

app = FastAPI(title="Shadow Analyzer API", version="1.0.0")

# Abilitiamo CORS per permettere al Frontend (React) di parlare con noi
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In produzione restringere al dominio del sito
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- MODELLI DATI ---
class AnalysisRequest(BaseModel):
    url: str

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

# --- FUNZIONI DI SUPPORTO ---

from phantom_scraper import run_phantom

def analyze_logic(text: str):
    """Invia il testo al LLM con il Shadow Prompt."""
    try:
        response = client.chat.completions.create(
            model="gpt-4o", # O "gpt-4-turbo"
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": f"ANALYZE THIS TEXT:\\n\\n{text}"}
            ],
            response_format={"type": "json_object"}, # Forza output JSON garantito
            temperature=0.2 # Bassa creatività, alta precisione analitica
        )
        return response.choices[0].message.content
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis Engine Failed: {str(e)}")

# --- ENDPOINTS ---

@app.post("/analyze")
async def run_analysis(request: AnalysisRequest):
    print(f"--- PHANTOM PROTOCOL INITIATED: {request.url} ---")
    
    try:
        # Usiamo il nostro browser custom
        raw_text = await run_phantom(request.url)
        print("--- EXTRACTION SUCCESSFUL ---")
    except Exception as e:
        print(f"!!! EXTRACTION FAILED: {str(e)}")
        # Se fallisce anche il Phantom, è un vero bunker digitale
        raise HTTPException(status_code=400, detail=f"Target Security Level Too High: {str(e)}")
    
    # 2. Inference Layer
    # PAYWALL / ENCRYPTION DETECTION
    # If the content is too short (< 500 chars), it's likely a Paywall or Bot Detection block.
    if not raw_text or len(raw_text) < 500:
        print(f"!!! ACCESS DENIED: Content length {len(raw_text) if raw_text else 0} chars (Threshold: 500)")
        raise HTTPException(
            status_code=400, 
            detail="TARGET SECURITY LEVEL TOO HIGH: ENCRYPTION / PAYWALL DETECTED. UNABLE TO EXTRACT NARRATIVE."
        )

    try:
        analysis_json = analyze_logic(raw_text)
        print("--- INFERENCE COMPLETE ---")
        
        # DEBUG: Stampiamo la risposta grezza per debuggare il JSON
        # print(f"DEBUG LLM RESPONSE: {analysis_json[:100]}...")

        import json
        return json.loads(analysis_json)
    except json.JSONDecodeError as je:
        error_msg = f"JSON PARSING FAILED: {str(je)}\nRAW CONTENT: {analysis_json}"
        print(error_msg)
        with open("server_error.log", "a") as f:
            f.write(f"\n[JSON ERROR] {error_msg}\n")
        raise HTTPException(status_code=500, detail="AI Inference Error: Invalid JSON Format from Engine.")
    except Exception as e:
        error_msg = f"UNEXPECTED ERROR: {str(e)}"
        print(f"!!! {error_msg}")
        with open("server_error.log", "a") as f:
            f.write(f"\n[SYSTEM ERROR] {error_msg}\n")
        raise HTTPException(status_code=500, detail=f"Internal System Error: {str(e)}")

# --- GLOBAL OVERWATCH MODULE (GEOINT) ---
import feedparser

# ISO Alpha-2 -> Google News RSS Parameters
# Ensures local news perspective, not US-centric view
GEO_CONFIG = {
    "IT": {"hl": "it", "gl": "IT", "ceid": "IT:it", "name": "Italy"},
    "US": {"hl": "en-US", "gl": "US", "ceid": "US:en", "name": "United States"},
    "GB": {"hl": "en-GB", "gl": "GB", "ceid": "GB:en", "name": "United Kingdom"},
    "DE": {"hl": "de", "gl": "DE", "ceid": "DE:de", "name": "Germany"},
    "FR": {"hl": "fr", "gl": "FR", "ceid": "FR:fr", "name": "France"},
    "RU": {"hl": "ru", "gl": "RU", "ceid": "RU:ru", "name": "Russia"},
    "UA": {"hl": "uk", "gl": "UA", "ceid": "UA:uk", "name": "Ukraine"},
    "CN": {"hl": "zh-CN", "gl": "CN", "ceid": "CN:zh-Hans", "name": "China"},
    "JP": {"hl": "ja", "gl": "JP", "ceid": "JP:ja", "name": "Japan"},
    "IN": {"hl": "en-IN", "gl": "IN", "ceid": "IN:en", "name": "India"},
    "BR": {"hl": "pt-BR", "gl": "BR", "ceid": "BR:pt-419", "name": "Brazil"},
    "IL": {"hl": "he", "gl": "IL", "ceid": "IL:he", "name": "Israel"},
    "IR": {"hl": "fa", "gl": "IR", "ceid": "IR:fa", "name": "Iran"},
    "SA": {"hl": "ar", "gl": "SA", "ceid": "SA:ar", "name": "Saudi Arabia"},
    "AU": {"hl": "en-AU", "gl": "AU", "ceid": "AU:en", "name": "Australia"},
    "KR": {"hl": "ko", "gl": "KR", "ceid": "KR:ko", "name": "South Korea"},
}

@app.get("/recon/geo")
async def geo_recon(country_code: str):
    """
    GLOBAL OVERWATCH: Surface Intelligence Collector.
    Fetches top news headlines for a given country via Google News RSS.
    No deep analysis - just target acquisition.
    """
    config = GEO_CONFIG.get(country_code.upper())
    if not config:
        return {
            "sector": country_code,
            "status": "SECTOR_UNMAPPED",
            "count": 0,
            "data": []
        }
    
    print(f">>> OVERWATCH ENGAGED: Scanning {config['name']} ({country_code})")
    
    # Google News RSS (undocumented but stable endpoint)
    rss_url = f"https://news.google.com/rss?hl={config['hl']}&gl={config['gl']}&ceid={config['ceid']}"
    
    try:
        feed = feedparser.parse(rss_url)
        
        intel_packet = []
        for entry in feed.entries[:10]:  # Limit to top 10 for speed
            intel_packet.append({
                "title": entry.title,
                "source": entry.source.title if hasattr(entry, 'source') and hasattr(entry.source, 'title') else "Unknown",
                "published": entry.get('published', 'N/A'),
                "url": entry.link,
                "id": entry.get('id', entry.link)
            })
        
        print(f">>> TARGETS ACQUIRED: {len(intel_packet)} vectors identified")
        
        return {
            "sector": country_code,
            "sector_name": config['name'],
            "status": "TARGETS_ACQUIRED",
            "count": len(intel_packet),
            "data": intel_packet
        }
    except Exception as e:
        print(f"!!! OVERWATCH FAILURE: {str(e)}")
        return {
            "sector": country_code,
            "status": "RECON_FAILED",
            "error": str(e),
            "count": 0,
            "data": []
        }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
