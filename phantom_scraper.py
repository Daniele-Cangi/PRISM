import asyncio
import random
import time
import numpy as np
from playwright.async_api import async_playwright, Page, TimeoutError as PlaywrightTimeoutError
from bs4 import BeautifulSoup

# --- CONFIGURAZIONE BIO-MIMETICA ---
# Questi parametri definiscono la "personalità" del browser fantasma
HUMAN_DILATION = 1.2 # Rallenta tutto per sembrare umano
VIEWPORT_OPTS = {"width": 1920, "height": 1080}

class PhantomScraper:
    def __init__(self):
        self.browser = None
        self.context = None

    async def _stealth_injection(self, page: Page):
        """
        Inietta script JS a livello di CDP per sovrascrivere le proprietà
        che rivelano l'automazione (Headless detection bypass).
        """
        await page.add_init_script("""
            // 1. Sovrascrive navigator.webdriver
            Object.defineProperty(navigator, 'webdriver', {
                get: () => undefined,
            });
            
            // 2. Mocking dei plugin per sembrare un PC consumer
            Object.defineProperty(navigator, 'plugins', {
                get: () => [1, 2, 3, 4, 5],
            });

            // 3. WebGL Vendor Spoofing (Nasconde che siamo su server Linux/Headless)
            const getParameter = WebGLRenderingContext.prototype.getParameter;
            WebGLRenderingContext.prototype.getParameter = function(parameter) {
                if (parameter === 37445) {
                    return 'Intel Inc.';
                }
                if (parameter === 37446) {
                    return 'Intel Iris OpenGL Engine';
                }
                return getParameter(parameter);
            };
            
            // 4. Broken Image Detection Bypass
            ['height', 'width'].forEach(property => {
                const imageDescriptor = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, property);
                Object.defineProperty(HTMLImageElement.prototype, property, {
                    ...imageDescriptor,
                    get: function() {
                        if (this.complete && this.naturalHeight == 0) {
                            return 20; // Fake dimensions for hidden tracking pixels
                        }
                        return imageDescriptor.get.apply(this);
                    },
                });
            });
        """)

    async def _human_mouse_move(self, page: Page):
        """
        Muove il mouse usando curve di Bezier per simulare l'imprecisione umana.
        Inganna i sistemi di tracciamento dell'entropia (mouse heatmaps).
        """
        width = VIEWPORT_OPTS['width']
        height = VIEWPORT_OPTS['height']
        
        # Genera punti casuali
        start_x, start_y = random.randint(0, width), random.randint(0, height)
        end_x, end_y = random.randint(0, width), random.randint(0, height)
        
        # Passaggi intermedi (steps)
        steps = random.randint(20, 50)
        
        await page.mouse.move(start_x, start_y)
        for i in range(steps):
            # Interpolazione lineare semplice + rumore randomico (jitter)
            t = i / steps
            x = start_x + (end_x - start_x) * t + random.uniform(-15, 15)
            y = start_y + (end_y - start_y) * t + random.uniform(-15, 15)
            
            await page.mouse.move(x, y)
            await asyncio.sleep(random.uniform(0.01, 0.05))

    async def _smart_scroll(self, page: Page):
        """
        Scrolla la pagina con pause irregolari, come se stesse leggendo.
        Essenziale per attivare il 'Lazy Loading' delle immagini/contenuti.
        """
        last_height = await page.evaluate("document.body.scrollHeight")
        
        while True:
            # Scroll down random amount
            scroll_amount = random.randint(400, 800)
            await page.mouse.wheel(0, scroll_amount)
            
            # Pausa di "lettura"
            await asyncio.sleep(random.uniform(0.5, 2.0))
            
            # A volte torna su un po' (ripensamento umano)
            if random.random() < 0.2:
                await page.mouse.wheel(0, -200)
                await asyncio.sleep(0.5)

            new_height = await page.evaluate("document.body.scrollHeight")
            if new_height == last_height:
                break
            last_height = new_height

    async def _handle_google_consent(self, page: Page):
        """
        Gestisce attivamente il muro di consenso di Google se rilevato.
        Cerca bottoni 'Accetta tutto', 'I agree', 'Accept all' e clicca.
        """
        try:
            # Selector list for Google Consent buttons (multilingual)
            consent_selectors = [
                "button[aria-label='Accetta tutto']",
                "button:has-text('Accetta tutto')",
                "button:has-text('I agree')",
                "button:has-text('Accept all')",
                "form[action*='consent'] button",
                "div[role='dialog'] button:last-child" # Spesso è l'ultimo bottone del dialog
            ]
            
            for selector in consent_selectors:
                if await page.locator(selector).first.is_visible(timeout=2000):
                    print(f">>> CONSENT WALL BREACHED: Clicking {selector}")
                    await page.click(selector)
                    await page.wait_for_load_state('networkidle', timeout=10000)
                    return
            
            print(">>> NO CONSENT WALL DETECTED (or selectors failed).")
            
        except Exception as e:
            print(f"!!! CONSENT BYPASS FAILED: {str(e)}")

    async def scrape(self, url: str):
        async with async_playwright() as p:
            # Lancio browser con argomenti per disabilitare le feature di sicurezza/automazione
            browser = await p.chromium.launch(
                headless=True, # Metti False se vuoi vederlo lavorare (debug mode)
                args=[
                    '--disable-blink-features=AutomationControlled',
                    '--no-sandbox',
                    '--disable-infobars',
                    '--window-size=1920,1080',
                    '--disable-background-timer-throttling',
                    '--disable-renderer-backgrounding'
                ]
            )
            
            # Creazione contesto con User Agent realistico e Locale coerente
            context = await browser.new_context(
                viewport=VIEWPORT_OPTS,
                user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                locale='en-US',
                timezone_id='America/New_York'
            )
            
            page = await context.new_page()
            
            # 1. Inject Stealth
            await self._stealth_injection(page)
            
            print(f">>> PHANTOM ENGAGED: Infiltrating {url}")
            
            try:
                # 2. Navigazione con timeout alto
                try:
                    await page.goto(url, wait_until='domcontentloaded', timeout=60000)
                except Exception as e:
                    print(f"!!! GOTO ERROR: {e}")

                # 3. GOOGLE REDIRECT / CONSENT BYPASS (Critical for Global Overwatch)
                if "google.com" in page.url:
                    print(">>> DETECTED GOOGLE INTERMEDIARY. ATTEMPTING EVASION...")
                    await self._handle_google_consent(page)
                    
                    # Wait for redirect to final target
                    try:
                        await page.wait_for_function("!window.location.href.includes('google.com')", timeout=20000)
                        print(f">>> REDIRECT SUCCESSFUL. TARGET LOCKED: {page.url}")
                    except:
                        print(f"!!! REDIRECT TIMEOUT. Stuck on: {page.url}")

                # 4. Bio-Mimicry Routine (post-redirect)
                await self._human_mouse_move(page)
                await self._smart_scroll(page)
                
                # 5. Snapshot finale
                content = await page.content()
                
                # 6. Parsing & Cleaning (BeautifulSoup)
                soup = BeautifulSoup(content, 'lxml')
                
                # Rimozione chirurgica del rumore
                for tag in soup(['script', 'style', 'noscript', 'iframe', 'svg', 'footer', 'nav', 'header']):
                    tag.decompose()
                
                # Estrazione testo principale con preservazione struttura (Markdown-like)
                # Cerca i contenitori comuni di articoli
                article = soup.find('article') or soup.find('main') or soup.find('div', class_=lambda x: x and 'content' in x) or soup.body
                
                if not article:
                    return ""

                text = article.get_text(separator='\\n\\n')
                clean_lines = [line.strip() for line in text.splitlines() if len(line.strip()) > 20] # Filtra linee troppo corte
                
                return "\\n".join(clean_lines)[:20000]

            except Exception as e:
                print(f"!!! PHANTOM ERROR: {e}")
                # We do not re-raise e here if we want to return what we have, but usually we raise or return empty
                raise e
            finally:
                await browser.close()

# Wrapper asincrono per l'integrazione con FastAPI
async def run_phantom(url):
    scraper = PhantomScraper()
    return await scraper.scrape(url)

if __name__ == "__main__":
    # Test locale
    print(asyncio.run(run_phantom("https://www.bloomberg.com/asia"))) # Test su un target difficile
