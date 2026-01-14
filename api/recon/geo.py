import json
import feedparser
from http.server import BaseHTTPRequestHandler
from urllib.parse import parse_qs, urlparse

# ISO Alpha-2 -> Google News RSS Parameters
GEO_CONFIG = {
    # NORTH AMERICA
    "US": {"hl": "en-US", "gl": "US", "ceid": "US:en", "name": "United States"},
    "CA": {"hl": "en-CA", "gl": "CA", "ceid": "CA:en", "name": "Canada"},
    "MX": {"hl": "es-419", "gl": "MX", "ceid": "MX:es-419", "name": "Mexico"},
    # EUROPE
    "GB": {"hl": "en-GB", "gl": "GB", "ceid": "GB:en", "name": "United Kingdom"},
    "DE": {"hl": "de", "gl": "DE", "ceid": "DE:de", "name": "Germany"},
    "FR": {"hl": "fr", "gl": "FR", "ceid": "FR:fr", "name": "France"},
    "IT": {"hl": "it", "gl": "IT", "ceid": "IT:it", "name": "Italy"},
    "ES": {"hl": "es", "gl": "ES", "ceid": "ES:es", "name": "Spain"},
    "NL": {"hl": "nl", "gl": "NL", "ceid": "NL:nl", "name": "Netherlands"},
    "BE": {"hl": "fr", "gl": "BE", "ceid": "BE:fr", "name": "Belgium"},
    "SE": {"hl": "sv", "gl": "SE", "ceid": "SE:sv", "name": "Sweden"},
    "NO": {"hl": "no", "gl": "NO", "ceid": "NO:no", "name": "Norway"},
    "PL": {"hl": "pl", "gl": "PL", "ceid": "PL:pl", "name": "Poland"},
    "UA": {"hl": "uk", "gl": "UA", "ceid": "UA:uk", "name": "Ukraine"},
    "RU": {"hl": "ru", "gl": "RU", "ceid": "RU:ru", "name": "Russia"},
    "TR": {"hl": "tr", "gl": "TR", "ceid": "TR:tr", "name": "Turkey"},
    "DK": {"hl": "da", "gl": "DK", "ceid": "DK:da", "name": "Denmark"},
    "CH": {"hl": "de-CH", "gl": "CH", "ceid": "CH:de", "name": "Switzerland"},
    "EE": {"hl": "et", "gl": "EE", "ceid": "EE:et", "name": "Estonia"},
    "LV": {"hl": "lv", "gl": "LV", "ceid": "LV:lv", "name": "Latvia"},
    "LT": {"hl": "lt", "gl": "LT", "ceid": "LT:lt", "name": "Lithuania"},
    # ASIA / PACIFIC
    "CN": {"hl": "zh-CN", "gl": "CN", "ceid": "CN:zh-Hans", "name": "China"},
    "JP": {"hl": "ja", "gl": "JP", "ceid": "JP:ja", "name": "Japan"},
    "IN": {"hl": "en-IN", "gl": "IN", "ceid": "IN:en", "name": "India"},
    "KR": {"hl": "ko", "gl": "KR", "ceid": "KR:ko", "name": "South Korea"},
    "TW": {"hl": "zh-TW", "gl": "TW", "ceid": "TW:zh-Hant", "name": "Taiwan"},
    "AU": {"hl": "en-AU", "gl": "AU", "ceid": "AU:en", "name": "Australia"},
    "NZ": {"hl": "en-NZ", "gl": "NZ", "ceid": "NZ:en", "name": "New Zealand"},
    "ID": {"hl": "id", "gl": "ID", "ceid": "ID:id", "name": "Indonesia"},
    # MIDDLE EAST
    "IL": {"hl": "he", "gl": "IL", "ceid": "IL:he", "name": "Israel"},
    "SA": {"hl": "ar", "gl": "SA", "ceid": "SA:ar", "name": "Saudi Arabia"},
    "AE": {"hl": "en-AE", "gl": "AE", "ceid": "AE:en", "name": "UAE"},
    "EG": {"hl": "ar", "gl": "EG", "ceid": "EG:ar", "name": "Egypt"},
    # LATIN AMERICA
    "BR": {"hl": "pt-BR", "gl": "BR", "ceid": "BR:pt-419", "name": "Brazil"},
    "AR": {"hl": "es-419", "gl": "AR", "ceid": "AR:es-419", "name": "Argentina"},
    "CO": {"hl": "es-419", "gl": "CO", "ceid": "CO:es-419", "name": "Colombia"},
    "VE": {"hl": "es-419", "gl": "VE", "ceid": "VE:es-419", "name": "Venezuela"},
    # AFRICA
    "ZA": {"hl": "en-ZA", "gl": "ZA", "ceid": "ZA:en", "name": "South Africa"},
    "NG": {"hl": "en-NG", "gl": "NG", "ceid": "NG:en", "name": "Nigeria"},
}

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        # Parse query parameters
        parsed = urlparse(self.path)
        params = parse_qs(parsed.query)
        country_code = params.get('country_code', [''])[0].upper()

        if not country_code:
            self.send_response(400)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({"detail": "country_code is required"}).encode())
            return

        config = GEO_CONFIG.get(country_code)
        if not config:
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({
                "sector": country_code,
                "status": "SECTOR_UNMAPPED",
                "count": 0,
                "data": []
            }).encode())
            return

        try:
            # Google News RSS
            rss_url = f"https://news.google.com/rss?hl={config['hl']}&gl={config['gl']}&ceid={config['ceid']}"
            feed = feedparser.parse(rss_url)

            intel_packet = []
            for entry in feed.entries[:10]:
                intel_packet.append({
                    "title": entry.title,
                    "source": entry.source.title if hasattr(entry, 'source') and hasattr(entry.source, 'title') else "Unknown",
                    "published": entry.get('published', 'N/A'),
                    "url": entry.link,
                    "id": entry.get('id', entry.link)
                })

            result = {
                "sector": country_code,
                "sector_name": config['name'],
                "status": "TARGETS_ACQUIRED",
                "count": len(intel_packet),
                "data": intel_packet
            }

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
            self.wfile.write(json.dumps({
                "sector": country_code,
                "status": "RECON_FAILED",
                "error": str(e),
                "count": 0,
                "data": []
            }).encode())

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
