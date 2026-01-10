# SHADOW // ANALYZER
### Adversarial Intelligence & Narrative Deconstruction Engine

![Status](https://img.shields.io/badge/STATUS-OPERATIONAL-00ff00?style=for-the-badge)
![Security](https://img.shields.io/badge/SECURITY-PHANTOM_PROTOCOL-blue?style=for-the-badge)
![Core](https://img.shields.io/badge/CORE-GPT--4o-purple?style=for-the-badge)

**SHADOW ANALYZER** is a specialized cognitive security, open-source intelligence (OSINT) tool designed to deconstruct adversarial narratives in real-time. It moves beyond simple "fake news detection" to analyze the *rhetorical architecture*, *strategic intent*, and *psychological triggers* embedded within digital content.

---

## 🏗️ Architecture

The system operates on a "Zero-Trust" architecture divided into three security layers:

### 1. The Interface (Lab Mode)
- **Tech Stack**: React (Vite), Tailwind CSS v3, Framer Motion.
- **Aesthetic**: "Cyber-Forensic" (Bloomberg Terminal meets Mil-Spec HUD).
- **Features**:
    - **Scanline & Glitch Effects**: Immersive tactical environment.
    - **Bento-Grid Dashboard**: Modular visualization of intelligence data.
    - **Real-Time Logs**: Visual feedback of the forensic scan process.

### 2. The Phantom Scraper (Stealth Extraction)
- **Tech Stack**: Python, Playwright, BeautifulSoup, NumPy.
- **Capabilities**:
    - **CDP Evasion**: Modifies Chrome DevTools Protocol to hide automation flags (`navigator.webdriver`).
    - **Bio-Mimicry**: Uses Bezier curves for human-like mouse movement and "Smart Scroll" to trigger lazy-loading.
    - **Hard Target Access**: Capable of infiltrating protected environments (e.g., Bloomberg, Reuters, walled gardens).
    - **Google Redirect Bypass**: Automatically negotiates Google News consent walls and redirect chains to reach the true intelligence vector.

### 3. Global Overwatch (GEOINT) [NEW]
- **Tech Stack**: React Simple Maps, d3-geo, Google News RSS.
- **Protocol**: `/recon/geo`
- **Capabilities**:
    - **Tactical Map (MapHUD)**: Interactive vector-based world map supporting 16 strategic sectors (US, CN, RU, IT, etc.).
    - **Sector Monitoring**: Real-time acquisition of top 10 narrative targets per country.
    - **Intel Feed**: Bento-style sidebar for rapid target selection and Deep Analysis injection.

### 4. Identify & Analyze (Cognitive Core)
- **Tech Stack**: Python (FastAPI), OpenAI GPT-4o.
- **Protocol**: `System Prompt v2.0` (Recalibrated).
- **Logic**:
    - **Dynamic Scoring**: 0-100 scale broken into discrete threat bands (Neutral, Leaning, Propaganda, Weaponized).
    - **Narrative Deconstruction**: A 500+ word forensic deep-dive into the article's framing and hidden axioms.
    - **Semantic Stripping**: Removes emotional adjectives to isolate raw facts.
    - **Paywall Logic**: Automatically detects and aborts analysis on encrypted/stub content (<500 chars).

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v18+)
- Python (3.12+)
- OpenAI API Key

### 1. Clone & Configure
```bash
git clone https://github.com/your-repo/shadow-analyzer.git
cd shadow-analyzer
```

### 2. Backend Deployment (The Engine)
Create a `.env` file in the root directory:
```env
OPENAI_API_KEY=sk-your-api-key-here
```

Install dependencies and install the Phantom browser:
```bash
pip install fastapi uvicorn requests beautifulsoup4 openai python-dotenv playwright playwright-stealth numpy
playwright install chromium
```

Launch the server:
```bash
python server.py
# Server will listen on http://0.0.0.0:8000
```

### 3. Frontend Deployment (The Interface)
In a new terminal:
```bash
npm install
npm run dev
# Interface accessible at http://localhost:5175
```

---

## ⚡ Usage

1. **Initialize**: Open the interface. The "System Ready" status should be visible.
2. **Target**: Paste any URL (News, Blog, Social Media Post) into the input field.
3. **Execute**: Click `ANALYZE`.
4. **Observe**:
    - **Phase 1**: Phantom Scraper infiltrates the target (Status: `BYPASSING_PROTOCOLS`).
    - **Phase 2**: Cognitive Engine processes the text (Status: `CALCULATING_VECTORS`).
    - **Phase 3**: Dashboard renders the `Forensic Report`.

---

## 📊 Output Schema

The engine returns a strict JSON object containing:

- **`meta.score`**: 0-100 Deception Score.
- **`meta.verdict_short`**: 5-word ruthless summary.
- **`intent`**: Strategic reason for publication (Cui Bono).
- **`facts`**: List of verifiable facts stripped of emotion.
- **`axioms`**: Hidden premises and omitted context.
- **`narrative_analysis`**: Long-form rhetorical deconstruction.

---

## 🛡️ Disclaimer

This tool is for **educational and research purposes only**. It is designed to analyze public information. The user assumes all responsibility for compliant usage with target terms of service.

> *"In an era of cognitive warfare, the only defense is the ability to deconstruct."*
