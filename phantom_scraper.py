import asyncio
import random
import time
import numpy as np
from playwright.async_api import async_playwright, Page, TimeoutError as PlaywrightTimeoutError
from bs4 import BeautifulSoup

# --- SHAPESHIFTER PROFILES ---
# 3 Distinct Identities to rotate through
PROFILES = [
    {
        "name": "Desktop Chrome",
        "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "viewport": {"width": 1920, "height": 1080},
        "is_mobile": False,
        "locale": "en-US",
        "platform": "Win32"
    },
    {
        "name": "iPhone 14 Pro",
        "user_agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1",
        "viewport": {"width": 393, "height": 852},
        "is_mobile": True,
        "locale": "en-US",
        "platform": "iPhone"
    },
    {
        "name": "Desktop Firefox",
        "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/115.0",
        "viewport": {"width": 1440, "height": 900},
        "is_mobile": False,
        "locale": "en-GB",
        "platform": "MacIntel"
    }
]

class PhantomScraper:
    def __init__(self):
        pass

    async def _stealth_injection(self, page: Page, profile: dict):
        """
        Inietta script JS a livello di CDP per sovrascrivere le proprietà
        che rivelano l'automazione, adattate al profilo corrente.
        """
        # Common Stealth
        stealth_script = """
            Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
            Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
        """

        # Profile specific injections
        if profile["is_mobile"]:
             stealth_script += """
                Object.defineProperty(navigator, 'maxTouchPoints', { get: () => 5 });
                Object.defineProperty(navigator, 'ontouchstart', { get: () => null });
             """
        else:
             stealth_script += """
                 Object.defineProperty(navigator, 'maxTouchPoints', { get: () => 0 });
             """

        # WebGL & Hardware Spoofing
        stealth_script += """
            const getParameter = WebGLRenderingContext.prototype.getParameter;
            WebGLRenderingContext.prototype.getParameter = function(parameter) {
                if (parameter === 37445) return 'Intel Inc.';
                if (parameter === 37446) return 'Intel Iris OpenGL Engine';
                return getParameter(parameter);
            };
        """
        
        await page.add_init_script(stealth_script)

    async def _human_interaction(self, page: Page, profile: dict):
        """
        Simula interazione umana basata sul dispositivo.
        """
        if profile["is_mobile"]:
            # Mobile: Scroll gestures (Touch simulation)
            for _ in range(random.randint(2, 4)):
                # Swipe Up
                start_y = random.randint(400, 600)
                end_y = start_y - random.randint(200, 300)
                await page.mouse.move(random.randint(50, 300), start_y)
                await page.mouse.down()
                await page.mouse.move(random.randint(50, 300), end_y, steps=10)
                await page.mouse.up()
                await asyncio.sleep(random.uniform(0.5, 1.5))
        else:
            # Desktop: Mouse moves and Wheel
            width = profile['viewport']['width']
            height = profile['viewport']['height']
            
            # Random mouse moves
            for _ in range(random.randint(5, 10)):
                x = random.randint(0, width)
                y = random.randint(0, height)
                await page.mouse.move(x, y, steps=random.randint(5, 15))
                await asyncio.sleep(random.uniform(0.1, 0.3))
            
            # Reading scroll
            await page.mouse.wheel(0, random.randint(300, 700))
            await asyncio.sleep(random.uniform(1.0, 2.5))

    async def _scrape_with_profile(self, url: str, profile: dict):
        async with async_playwright() as p:
            print(f"   >>> SHAPESHIFTING: Morphing into {profile['name']}...")
            
            browser = await p.chromium.launch(
                headless=True,
                args=[
                    '--disable-blink-features=AutomationControlled',
                    '--no-sandbox',
                    '--disable-infobars',
                    '--disable-background-timer-throttling'
                ]
            )
            
            context = await browser.new_context(
                viewport=profile['viewport'],
                user_agent=profile['user_agent'],
                locale=profile['locale'],
                timezone_id='America/New_York',
                is_mobile=profile['is_mobile'],
                has_touch=profile['is_mobile'],
                device_scale_factor=2 if profile['is_mobile'] else 1
            )
            
            page = await context.new_page()
            await self._stealth_injection(page, profile)
            
            try:
                # 1. Navigation
                response = await page.goto(url, wait_until='domcontentloaded', timeout=45000)
                
                # Check status
                if response and response.status in [403, 401]:
                    print("   !!! FIREWALL BLOCKED (403/401)")
                    return None
                
                # 2. Google Bypass (if needed)
                if "google.com" in page.url or "consent.google" in page.url:
                    print("   >>> GOOGLE INTERCEPT DETECTED. Engaging Evasion Protocol...")
                    await self._handle_google_consent(page)
                    # Relaxed: We don't block on URL anymore, we trust the extraction filter
                    await page.wait_for_timeout(3000) 
                
                # 3. Bio-Mimicry
                await self._human_interaction(page, profile)
                
                # 4. Extraction
                content = await page.content()
                soup = BeautifulSoup(content, 'lxml')
                
                # Remove noise
                for tag in soup(['script', 'style', 'noscript', 'iframe', 'svg', 'footer', 'nav', 'header', 'aside']):
                    tag.decompose()
                
                # Extract Text
                text = soup.get_text(separator='\\n\\n')
                clean_lines = [line.strip() for line in text.splitlines() if len(line.strip()) > 30]
                full_text = "\\n".join(clean_lines)
                
                # Validation - Content Based
                junk_signatures = [
                    "accetta tutto", "accept all", "cookie policy", "privacy checkup",
                    "quando usi i nostri servizi", "scopri di più", "before you continue",
                    "tutto quello che devi sapere", "personalizza", "gestisci opzioni"
                ]
                
                # Check 1: Length
                if len(full_text) < 500:
                    print(f"   !!! CONTENT TOO SHORT ({len(full_text)} chars). Likely CAPTCHA or JS Wall.")
                    return None
                
                # Check 2: Junk Content (Consent Wall Leak)
                sample = full_text[:1000].lower()
                if any(sig in sample for sig in junk_signatures):
                     print(f"   !!! JUNK CONTENT DETECTED (Consent Wall): {sample[:100]}...")
                     return None
                    
                return full_text[:25000]

            except Exception as e:
                print(f"   !!! PROFILE FAILED {profile['name']}: {str(e)}")
                return None
            finally:
                await browser.close()

    async def _handle_google_consent(self, page: Page):
        """
        Gestisce sia il banner dei consensi che eventuali interstitial di redirect.
        """
        print("      > SCANNING FOR GOOGLE TRAPS...")
        try:
            # 1. Give it a moment to settle/redirect naturally
            await page.wait_for_timeout(2000)
            
            # 2. Consent Buttons (Broad Selectors)
            consent_selectors = [
                 "button[aria-label='Accetta tutto']", 
                 "button:has-text('Accetta tutto')", 
                 "button:has-text('I agree')", 
                 "button:has-text('Accept all')",
                 "form[action*='consent'] button",
                 "div[role='button']:has-text('Accetta')"
            ]
            
            for selector in consent_selectors:
                if await page.locator(selector).first.is_visible(timeout=500):
                    print(f"      > CONSENT BUTTON FOUND: {selector}")
                    await page.click(selector, timeout=1000)
                    await page.wait_for_load_state('networkidle', timeout=3000)
                    return # Assuming click triggers the next phase
            
            # 3. "Click here if not redirected" (News Interstitial)
            # Sometimes Google News shows a link "Redirecting..." or just the article title link
            if "news.google.com" in page.url:
                print("      > CHECKING FOR STUCK REDIRECT...")
                # Try clicking the main link if visible
                article_link = page.locator("a[href^='http']").first
                if await article_link.is_visible():
                    print("      > CLICKING MANUAL REDIRECT LINK")
                    await article_link.click(timeout=1000)
                    
        except Exception as e:
            print(f"      ! TRAP EVASION ERROR: {str(e)}")

    async def scrape(self, url: str):
        # SHAPESHIFTER LOOP
        print(f">>> TARGET LOCKED: {url}")
        
        for i, profile in enumerate(PROFILES):
            print(f">>> ATTEMPT {i+1}/3: Protocol {profile['name']}")
            
            result = await self._scrape_with_profile(url, profile)
            
            if result:
                print(f">>> EXTRACTION SUCCESSFUL via {profile['name']}")
                return result
             
            # If failed, wait before shapeshifting
            if i < len(PROFILES) - 1:
                wait_time = random.uniform(2, 5) # Slightly reduced cooldown
                print(f">>> EVASION MANEUVER: Cooling down for {wait_time:.1f}s...")
                await asyncio.sleep(wait_time)
        
        print("!!! MISSION FAILED: All profiles exhausted.")
        return ""

# Wrapper
async def run_phantom(url):
    scraper = PhantomScraper()
    return await scraper.scrape(url)

if __name__ == "__main__":
    # Test with a real Google News redirect link
    test_url = "https://news.google.com/rss/articles/CBMiVkFVX3lxTE5zOFp1V0t3am5oVlJQZVl2TTEwWlVqV0J6Y3Fkc09XUjFhWkZ3T3J0dUVwS1FzX3B5VFpHTlNFWnpEUU15ZG1wQW5iRjN5WkpaQmVuR1E?oc=5"
    print(asyncio.run(run_phantom(test_url)))
