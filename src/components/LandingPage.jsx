import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader, ChevronDown, FileText } from 'lucide-react';

const LandingPage = ({ onLogin }) => {
  const [language, setLanguage] = useState('en');
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isComingSoonOpen, setIsComingSoonOpen] = useState(false);
  const [isDocsModalOpen, setIsDocsModalOpen] = useState(false);

  // Traduzioni
  const translations = {
    en: {
      code: 'EN',
      flag: '🇬🇧',
      name: 'English',
      // Hero
      cognitiveGrid: 'See through the narrative',
      // Login
      loginTitle: 'Sign in to continue',
      continueGoogle: 'Continue with Google',
      continueMicrosoft: 'Continue with Microsoft',
      or: 'or',
      guestAccess: 'Enter as Guest',
      termsText: 'By signing in you accept our Terms of Service and Privacy Policy',
      scrollMore: 'Discover more',
      // Mission
      missionTitle: 'Our Mission',
      missionText1: 'In an era of information overload, distinguishing truth from manipulation has become essential for democracy.',
      missionText2: 'Prism was created to give citizens the power to see beyond the narrative. We are building a team of experts in journalism, artificial intelligence and cybersecurity united by a common vision.',
      theFounders: 'The Founders',
      roleEvangelist: 'Project Evangelist',
      roleAIDev: 'AI Developer',
      roleDev: 'Full Stack Developer',
      // Sponsorship
      supportTitle: 'Support the Project',
      supportText: 'Prism is an open source project. Soon you will be able to support our development and help us build this tool for information democracy. (Coming Soon)',
      sponsorGithub: 'Sponsor directly on GitHub',
      sponsor: 'Sponsor',
      becomePatron: 'Become a monthly patron',
      patron: 'Become Patron',
      buyCoffee: 'Buy us a coffee',
      coffee: 'Buy a Coffee',
      kofiSupport: 'One-time or monthly support',
      kofiBtn: 'Support on Ko-fi',
      supportThanks: 'Every contribution, big or small, helps us keep Prism free and open source.',
      thanksHeart: '❤️ Thank you for your support!',
      // Legal Transparency
      legalTitle: 'Infrastructure & Partners',
      legalText: 'Prism is an open source project powered by research labs and organizations that believe in information democracy. We welcome partnerships with entities that share our vision.',
      legalMonitored: 'Infrastructure supported by',
      legalVerified: 'Open Source Project',
      legalBtn: 'Visit Lab',
      legalLabName: 'AI Research Laboratory',
      legalBecomeSupporter: 'Become a Supporter',
      legalSupporterText: 'Is your organization interested in supporting the project?',
      legalSupporterBtn: 'Join as Partner',
      // Contact
      contactTitle: 'Follow and Contact Us',
      contactText: 'Stay updated on our projects and AI innovations',
      codeAndCoffee: 'Code & coffee',
      letsTalk: "Let's talk",
      houston: 'Houston, we have a problem',
      aiLab: 'Artificial Intelligence Laboratory',
      // Join Team
      joinTeam: 'Join the Team',
      joinSlogan: 'Be part of the change',
      joinModalTitle: 'Join Our Mission',
      joinModalText: 'Connect with us to join the team',
      joinViaGithub: 'Apply via GitHub',
      joinViaLinkedin: 'Connect on LinkedIn',
      joinOptionalNote: 'or leave a note',
      joinNotePlaceholder: 'Tell us about yourself (optional)',
      comingSoonTitle: 'Coming Soon',
      comingSoonText: 'We are working to activate sponsorship options. Soon you will be able to support the project!',
      comingSoonClose: 'Got it',
      // Docs Modal
      docsTitle: 'Technical Documentation',
      docsVersion: 'Cognitive Security Engine',
      docsWhatIs: 'What is PRISM?',
      docsIntro: 'PRISM is your digital truth detector.',
      docsIntroText: "In a world flooded with news, opinions, and propaganda, it's increasingly difficult to distinguish facts from manipulation.",
      docsStep1Title: 'Paste an Article',
      docsStep1Text: 'Copy any news URL from any source worldwide',
      docsStep2Title: 'AI Analysis',
      docsStep2Text: 'Our engine reads and deconstructs the narrative',
      docsStep3Title: 'Get the Truth',
      docsStep3Text: 'Receive a bias score, hidden agendas, and verified facts',
      docsReveals: 'What PRISM Reveals:',
      docsBiasScore: 'Bias Score (0-100):',
      docsBiasText: 'How manipulative is the article? 0 = neutral journalism, 100 = pure propaganda',
      docsHiddenInt: 'Hidden Intentions:',
      docsHiddenText: 'Why was this published? Who benefits from you believing this?',
      docsVerifiedFacts: 'Verified Facts:',
      docsVerifiedText: "What's actually true vs what's opinion or spin",
      docsManipulation: 'Manipulation Tactics:',
      docsManipText: 'Emotional triggers, logical fallacies, and rhetorical tricks used',
      docsMetaphor: "Think of PRISM as X-ray vision for news. We don't tell you what to think — we show you how others are trying to make you think.",
      docsTechDetails: 'Technical Details',
      docsSystemOverview: 'SYSTEM OVERVIEW',
      docsSystemText1: 'is a cognitive security platform designed for',
      docsSystemText2: 'adversarial text analysis',
      docsSystemText3: 'and',
      docsSystemText4: 'narrative deconstruction',
      docsSystemText5: 'Operating on a',
      docsZeroTrust: 'Zero-Trust Logic',
      docsSystemText6: 'framework, the system assumes every text input is potentially designed to persuade, manipulate, or obscure reality.',
      docsArchitecture: 'ARCHITECTURE',
      docsFrontend: 'Frontend Layer',
      docsBackend: 'Backend Layer',
      docsProtocol: 'OPERATIONAL PROTOCOL',
      docsSemantic: 'SEMANTIC STRIPPING',
      docsSemanticText: 'Isolate hard facts from emotional framing. Extract objective data points from subjective narrative layers.',
      docsNarrative: 'NARRATIVE DECODING',
      docsNarrativeText: 'Identify logical fallacies, hidden axioms, and manipulative tones. Map rhetorical devices and propaganda patterns.',
      docsIntent: 'INTENT INFERENCE',
      docsIntentText: 'Determine strategic intent: Why is this being published now? Cui Bono analysis (who benefits).',
      docsScoring: 'SCORING CALIBRATION',
      docsNeutral: 'NEUTRAL',
      docsNeutralText: 'Dry reporting, factual, verified sources (AP/Reuters Wire)',
      docsLeaning: 'LEANING',
      docsLeaningText: 'Editorialized, slight bias, persuasive adjectives',
      docsPropaganda: 'PROPAGANDA',
      docsPropagandaText: 'Heavy emotional framing, logical fallacies, clear agenda',
      docsWeaponized: 'WEAPONIZED',
      docsWeaponizedText: 'Disinformation, psychological warfare, fabrication',
      docsPhantom: 'PHANTOM SCRAPER MODULE',
      docsPhantomText: 'Advanced web extraction engine using',
      docsPhantomText2: 'headless browser with anti-detection capabilities:',
      docsShapeshifter: 'Shapeshifter Profiles:',
      docsShapeshifterText: 'Rotates between Desktop Chrome, iPhone 14 Pro, Desktop Firefox',
      docsStealth: 'Stealth Injection:',
      docsStealthText: 'Overwrites navigator.webdriver, WebGL fingerprint spoofing',
      docsBioMimicry: 'Bio-Mimicry:',
      docsBioMimicryText: 'Human-like mouse movements, scroll patterns, touch gestures',
      docsGoogleBypass: 'Google Consent Bypass:',
      docsGoogleBypassText: 'Automatic handling of cookie walls and interstitials',
      docsGeoint: 'GLOBAL OVERWATCH (GEOINT)',
      docsGeointText: 'Real-time intelligence gathering from',
      docsGeointText2: '35+ geographic sectors',
      docsGeointText3: 'via Google News RSS with localized perspectives:',
      docsOutput: 'OUTPUT SCHEMA',
      docsFooter: 'PRISM Cognitive Security Engine | Open Source Project',
      docsQuote: 'Democracy Dies in Darkness. Logic Survives in Light.'
    },
    da: {
      code: 'DK',
      flag: '🇩🇰',
      name: 'Dansk',
      cognitiveGrid: 'Se igennem narrativet',
      loginTitle: 'Log ind for at fortsætte',
      continueGoogle: 'Fortsæt med Google',
      continueMicrosoft: 'Fortsæt med Microsoft',
      or: 'eller',
      guestAccess: 'Fortsæt som gæst',
      termsText: 'Ved at logge ind accepterer du vores servicevilkår og privatlivspolitik',
      scrollMore: 'Opdag mere',
      missionTitle: 'Vores Mission',
      missionText1: 'I en tid med informationsoverbelastning er det blevet afgørende for demokratiet at skelne sandhed fra manipulation.',
      missionText2: 'Prism blev skabt for at give borgerne magten til at se ud over narrativet. Vi er ved at opbygge et team af eksperter inden for journalistik, kunstig intelligens og cybersikkerhed forenet af en fælles vision.',
      theFounders: 'Grundlæggerne',
      roleEvangelist: 'Projektevangelist',
      roleAIDev: 'AI-udvikler',
      roleDev: 'Full Stack Udvikler',
      supportTitle: 'Støt Projektet',
      supportText: 'Prism er et open source-projekt. Snart vil du kunne støtte vores udvikling og hjælpe os med at bygge dette værktøj for informationsdemokrati. (Kommer snart)',
      sponsorGithub: 'Sponsor direkte på GitHub',
      sponsor: 'Sponsor',
      becomePatron: 'Bliv månedlig patron',
      patron: 'Bliv Patron',
      buyCoffee: 'Køb os en kaffe',
      coffee: 'Køb en Kaffe',
      kofiSupport: 'Engangsstøtte eller månedlig',
      kofiBtn: 'Støt på Ko-fi',
      supportThanks: 'Hvert bidrag, stort som lille, hjælper os med at holde Prism gratis og open source.',
      thanksHeart: '❤️ Tak for din støtte!',
      legalTitle: 'Infrastruktur & Partnere',
      legalText: 'Prism er et open source-projekt drevet af forskningslaboratorier og organisationer, der tror på informationsdemokrati. Vi byder partnerskaber velkommen med enheder, der deler vores vision.',
      legalMonitored: 'Infrastruktur understøttet af',
      legalVerified: 'Open Source Projekt',
      legalBtn: 'Besøg Lab',
      legalLabName: 'AI Forskningslaboratorium',
      legalBecomeSupporter: 'Bliv Supporter',
      legalSupporterText: 'Er din organisation interesseret i at støtte projektet?',
      legalSupporterBtn: 'Deltag som Partner',
      contactTitle: 'Følg og Kontakt Os',
      contactText: 'Hold dig opdateret om vores projekter og AI-innovationer',
      codeAndCoffee: 'Kode & kaffe',
      letsTalk: 'Lad os tale',
      houston: 'Houston, vi har et problem',
      aiLab: 'Laboratorium for Kunstig Intelligens',
      joinTeam: 'Bliv en del af teamet',
      joinSlogan: 'Vær med til forandringen',
      joinModalTitle: 'Deltag i vores mission',
      joinModalText: 'Forbind med os for at blive en del af teamet',
      joinViaGithub: 'Ansøg via GitHub',
      joinViaLinkedin: 'Forbind på LinkedIn',
      joinOptionalNote: 'eller efterlad en note',
      joinNotePlaceholder: 'Fortæl os om dig selv (valgfrit)',
      comingSoonTitle: 'Kommer snart',
      comingSoonText: 'Vi arbejder på at aktivere sponsormuligheder. Snart vil du kunne støtte projektet!',
      comingSoonClose: 'Forstået',
      // Docs Modal
      docsTitle: 'Teknisk Dokumentation',
      docsVersion: 'Kognitiv Sikkerhedsmotor',
      docsWhatIs: 'Hvad er PRISM?',
      docsIntro: 'PRISM er din digitale sandhedsdetektor.',
      docsIntroText: 'I en verden oversvømmet af nyheder, meninger og propaganda er det stadig sværere at skelne fakta fra manipulation.',
      docsStep1Title: 'Indsæt en Artikel',
      docsStep1Text: 'Kopiér enhver nyheds-URL fra enhver kilde verden over',
      docsStep2Title: 'AI-Analyse',
      docsStep2Text: 'Vores motor læser og dekonstruerer narrativet',
      docsStep3Title: 'Få Sandheden',
      docsStep3Text: 'Modtag en bias-score, skjulte dagsordener og verificerede fakta',
      docsReveals: 'Hvad PRISM Afslører:',
      docsBiasScore: 'Bias-Score (0-100):',
      docsBiasText: 'Hvor manipulerende er artiklen? 0 = neutral journalistik, 100 = ren propaganda',
      docsHiddenInt: 'Skjulte Intentioner:',
      docsHiddenText: 'Hvorfor blev dette publiceret? Hvem drager fordel af at du tror på dette?',
      docsVerifiedFacts: 'Verificerede Fakta:',
      docsVerifiedText: 'Hvad er faktisk sandt vs hvad er mening eller spin',
      docsManipulation: 'Manipulationstaktikker:',
      docsManipText: 'Emotionelle triggere, logiske fejlslutninger og retoriske tricks anvendt',
      docsMetaphor: 'Tænk på PRISM som røntgensyn for nyheder. Vi fortæller dig ikke hvad du skal tænke — vi viser dig hvordan andre forsøger at få dig til at tænke.',
      docsTechDetails: 'Tekniske Detaljer',
      docsSystemOverview: 'SYSTEMOVERSIGT',
      docsSystemText1: 'er en kognitiv sikkerhedsplatform designet til',
      docsSystemText2: 'modstandsdygtig tekstanalyse',
      docsSystemText3: 'og',
      docsSystemText4: 'narrativ dekonstruktion',
      docsSystemText5: 'Opererer på et',
      docsZeroTrust: 'Zero-Trust Logic',
      docsSystemText6: 'framework, systemet antager at hvert tekstinput potentielt er designet til at overbevise, manipulere eller tilsløre virkeligheden.',
      docsArchitecture: 'ARKITEKTUR',
      docsFrontend: 'Frontend Lag',
      docsBackend: 'Backend Lag',
      docsProtocol: 'OPERATIONEL PROTOKOL',
      docsSemantic: 'SEMANTISK STRIPPING',
      docsSemanticText: 'Isolér hårde fakta fra emotionel ramme. Udtræk objektive datapunkter fra subjektive narrative lag.',
      docsNarrative: 'NARRATIV AFKODNING',
      docsNarrativeText: 'Identificér logiske fejlslutninger, skjulte aksiomer og manipulative toner. Kortlæg retoriske virkemidler og propagandamønstre.',
      docsIntent: 'INTENTIONSINFERENS',
      docsIntentText: 'Bestem strategisk intention: Hvorfor publiceres dette nu? Cui Bono analyse (hvem drager fordel).',
      docsScoring: 'SCORE KALIBRERING',
      docsNeutral: 'NEUTRAL',
      docsNeutralText: 'Tør reportage, faktuel, verificerede kilder (AP/Reuters Wire)',
      docsLeaning: 'HÆLDENDE',
      docsLeaningText: 'Redigeret, let bias, overbevisende adjektiver',
      docsPropaganda: 'PROPAGANDA',
      docsPropagandaText: 'Tung emotionel ramme, logiske fejlslutninger, klar dagsorden',
      docsWeaponized: 'VÅBENGJORT',
      docsWeaponizedText: 'Desinformation, psykologisk krigsførelse, fabrikation',
      docsPhantom: 'PHANTOM SCRAPER MODUL',
      docsPhantomText: 'Avanceret web-ekstraktionsmotor bruger',
      docsPhantomText2: 'headless browser med anti-detektionsevner:',
      docsShapeshifter: 'Shapeshifter Profiler:',
      docsShapeshifterText: 'Roterer mellem Desktop Chrome, iPhone 14 Pro, Desktop Firefox',
      docsStealth: 'Stealth Injektion:',
      docsStealthText: 'Overskriver navigator.webdriver, WebGL fingeraftryk spoofing',
      docsBioMimicry: 'Bio-Mimicry:',
      docsBioMimicryText: 'Menneskelignende musebevægelser, scrollmønstre, touch-gestikker',
      docsGoogleBypass: 'Google Consent Bypass:',
      docsGoogleBypassText: 'Automatisk håndtering af cookie-vægge og interstitials',
      docsGeoint: 'GLOBAL OVERWATCH (GEOINT)',
      docsGeointText: 'Real-time efterretningsindsamling fra',
      docsGeointText2: '35+ geografiske sektorer',
      docsGeointText3: 'via Google News RSS med lokaliserede perspektiver:',
      docsOutput: 'OUTPUT SKEMA',
      docsFooter: 'PRISM Kognitiv Sikkerhedsmotor | Open Source Projekt',
      docsQuote: 'Demokrati Dør i Mørke. Logik Overlever i Lyset.'
    },
    sv: {
      code: 'SE',
      flag: '🇸🇪',
      name: 'Svenska',
      cognitiveGrid: 'Se genom narrativet',
      loginTitle: 'Logga in för att fortsätta',
      continueGoogle: 'Fortsätt med Google',
      continueMicrosoft: 'Fortsätt med Microsoft',
      or: 'eller',
      guestAccess: 'Fortsätt som gäst',
      termsText: 'Genom att logga in accepterar du våra användarvillkor och sekretesspolicy',
      scrollMore: 'Upptäck mer',
      missionTitle: 'Vårt Uppdrag',
      missionText1: 'I en tid av informationsöverflöd har det blivit avgörande för demokratin att skilja sanning från manipulation.',
      missionText2: 'Prism skapades för att ge medborgarna makten att se bortom narrativet. Vi bygger ett team av experter inom journalistik, artificiell intelligens och cybersäkerhet förenade av en gemensam vision.',
      theFounders: 'Grundarna',
      roleEvangelist: 'Projektevangelist',
      roleAIDev: 'AI-utvecklare',
      roleDev: 'Full Stack Utvecklare',
      supportTitle: 'Stöd Projektet',
      supportText: 'Prism är ett open source-projekt. Snart kommer du att kunna stödja vår utveckling och hjälpa oss bygga detta verktyg för informationsdemokrati. (Kommer snart)',
      sponsorGithub: 'Sponsra direkt på GitHub',
      sponsor: 'Sponsra',
      becomePatron: 'Bli månadspatron',
      patron: 'Bli Patron',
      buyCoffee: 'Bjud oss på en kaffe',
      coffee: 'Köp en Kaffe',
      kofiSupport: 'Engångsstöd eller månatligt',
      kofiBtn: 'Stöd på Ko-fi',
      supportThanks: 'Varje bidrag, stort som litet, hjälper oss att hålla Prism gratis och open source.',
      thanksHeart: '❤️ Tack för ditt stöd!',
      legalTitle: 'Infrastruktur & Partners',
      legalText: 'Prism är ett open source-projekt drivet av forskningslaboratorier och organisationer som tror på informationsdemokrati. Vi välkomnar partnerskap med enheter som delar vår vision.',
      legalMonitored: 'Infrastruktur stödd av',
      legalVerified: 'Open Source Projekt',
      legalBtn: 'Besök Lab',
      legalLabName: 'AI-forskningslaboratorium',
      legalBecomeSupporter: 'Bli Supporter',
      legalSupporterText: 'Är din organisation intresserad av att stödja projektet?',
      legalSupporterBtn: 'Gå med som Partner',
      contactTitle: 'Följ och Kontakta Oss',
      contactText: 'Håll dig uppdaterad om våra projekt och AI-innovationer',
      codeAndCoffee: 'Kod & kaffe',
      letsTalk: 'Låt oss prata',
      houston: 'Houston, vi har ett problem',
      aiLab: 'Laboratorium för Artificiell Intelligens',
      joinTeam: 'Gå med i teamet',
      joinSlogan: 'Var en del av förändringen',
      joinModalTitle: 'Delta i vårt uppdrag',
      joinModalText: 'Anslut med oss för att gå med i teamet',
      joinViaGithub: 'Ansök via GitHub',
      joinViaLinkedin: 'Anslut på LinkedIn',
      joinOptionalNote: 'eller lämna en anteckning',
      joinNotePlaceholder: 'Berätta om dig själv (valfritt)',
      comingSoonTitle: 'Kommer snart',
      comingSoonText: 'Vi arbetar med att aktivera sponsringsmöjligheter. Snart kommer du att kunna stödja projektet!',
      comingSoonClose: 'Uppfattat',
      // Docs Modal
      docsTitle: 'Teknisk Dokumentation',
      docsVersion: 'Kognitiv Säkerhetsmotor',
      docsWhatIs: 'Vad är PRISM?',
      docsIntro: 'PRISM är din digitala sanningsdetektor.',
      docsIntroText: 'I en värld översvämmad av nyheter, åsikter och propaganda är det allt svårare att skilja fakta från manipulation.',
      docsStep1Title: 'Klistra in en Artikel',
      docsStep1Text: 'Kopiera valfri nyhets-URL från vilken källa som helst i världen',
      docsStep2Title: 'AI-Analys',
      docsStep2Text: 'Vår motor läser och dekonstruerar narrativet',
      docsStep3Title: 'Få Sanningen',
      docsStep3Text: 'Få en bias-poäng, dolda agendor och verifierade fakta',
      docsReveals: 'Vad PRISM Avslöjar:',
      docsBiasScore: 'Bias-Poäng (0-100):',
      docsBiasText: 'Hur manipulativ är artikeln? 0 = neutral journalistik, 100 = ren propaganda',
      docsHiddenInt: 'Dolda Intentioner:',
      docsHiddenText: 'Varför publicerades detta? Vem gynnas av att du tror på detta?',
      docsVerifiedFacts: 'Verifierade Fakta:',
      docsVerifiedText: 'Vad är faktiskt sant vs vad är åsikt eller spin',
      docsManipulation: 'Manipulationstaktiker:',
      docsManipText: 'Emotionella triggers, logiska felslut och retoriska trick som används',
      docsMetaphor: 'Tänk på PRISM som röntgensyn för nyheter. Vi berättar inte vad du ska tänka — vi visar dig hur andra försöker få dig att tänka.',
      docsTechDetails: 'Tekniska Detaljer',
      docsSystemOverview: 'SYSTEMÖVERSIKT',
      docsSystemText1: 'är en kognitiv säkerhetsplattform designad för',
      docsSystemText2: 'motståndskraftig textanalys',
      docsSystemText3: 'och',
      docsSystemText4: 'narrativ dekonstruktion',
      docsSystemText5: 'Opererar på ett',
      docsZeroTrust: 'Zero-Trust Logic',
      docsSystemText6: 'ramverk, systemet antar att varje textinput potentiellt är designat för att övertyga, manipulera eller dölja verkligheten.',
      docsArchitecture: 'ARKITEKTUR',
      docsFrontend: 'Frontend-Lager',
      docsBackend: 'Backend-Lager',
      docsProtocol: 'OPERATIONELLT PROTOKOLL',
      docsSemantic: 'SEMANTISK STRIPPING',
      docsSemanticText: 'Isolera hårda fakta från emotionell inramning. Extrahera objektiva datapunkter från subjektiva narrativa lager.',
      docsNarrative: 'NARRATIV AVKODNING',
      docsNarrativeText: 'Identifiera logiska felslut, dolda axiom och manipulativa toner. Kartlägg retoriska verktyg och propagandamönster.',
      docsIntent: 'INTENTIONSINFERENS',
      docsIntentText: 'Bestäm strategisk intention: Varför publiceras detta nu? Cui Bono-analys (vem gynnas).',
      docsScoring: 'POÄNGKALIBRERING',
      docsNeutral: 'NEUTRAL',
      docsNeutralText: 'Torr rapportering, faktabaserad, verifierade källor (AP/Reuters Wire)',
      docsLeaning: 'LUTANDE',
      docsLeaningText: 'Redigerad, lätt bias, övertygande adjektiv',
      docsPropaganda: 'PROPAGANDA',
      docsPropagandaText: 'Tung emotionell inramning, logiska felslut, tydlig agenda',
      docsWeaponized: 'VAPENISERAD',
      docsWeaponizedText: 'Desinformation, psykologisk krigföring, fabricering',
      docsPhantom: 'PHANTOM SCRAPER MODUL',
      docsPhantomText: 'Avancerad webbextraktionsmotor använder',
      docsPhantomText2: 'headless webbläsare med anti-detektionsförmågor:',
      docsShapeshifter: 'Shapeshifter Profiler:',
      docsShapeshifterText: 'Roterar mellan Desktop Chrome, iPhone 14 Pro, Desktop Firefox',
      docsStealth: 'Stealth Injektion:',
      docsStealthText: 'Skriver över navigator.webdriver, WebGL fingeravtrycksspoofing',
      docsBioMimicry: 'Bio-Mimicry:',
      docsBioMimicryText: 'Människoliknande musrörelser, scrollmönster, touch-gester',
      docsGoogleBypass: 'Google Consent Bypass:',
      docsGoogleBypassText: 'Automatisk hantering av cookieväggar och interstitials',
      docsGeoint: 'GLOBAL OVERWATCH (GEOINT)',
      docsGeointText: 'Realtidsinsamling av underrättelser från',
      docsGeointText2: '35+ geografiska sektorer',
      docsGeointText3: 'via Google News RSS med lokaliserade perspektiv:',
      docsOutput: 'OUTPUT-SCHEMA',
      docsFooter: 'PRISM Kognitiv Säkerhetsmotor | Open Source Projekt',
      docsQuote: 'Demokrati Dör i Mörker. Logik Överlever i Ljuset.'
    },
    no: {
      code: 'NO',
      flag: '🇳🇴',
      name: 'Norsk',
      cognitiveGrid: 'Se gjennom narrativet',
      loginTitle: 'Logg inn for å fortsette',
      continueGoogle: 'Fortsett med Google',
      continueMicrosoft: 'Fortsett med Microsoft',
      or: 'eller',
      guestAccess: 'Fortsett som gjest',
      termsText: 'Ved å logge inn aksepterer du våre tjenestevilkår og personvernregler',
      scrollMore: 'Oppdag mer',
      missionTitle: 'Vårt Oppdrag',
      missionText1: 'I en tid med informasjonsoverbelastning har det blitt avgjørende for demokratiet å skille sannhet fra manipulasjon.',
      missionText2: 'Prism ble skapt for å gi borgerne makten til å se forbi narrativet. Vi bygger et team av eksperter innen journalistikk, kunstig intelligens og cybersikkerhet forent av en felles visjon.',
      theFounders: 'Grunnleggerne',
      roleEvangelist: 'Prosjektevangelist',
      roleAIDev: 'AI-utvikler',
      roleDev: 'Full Stack Utvikler',
      supportTitle: 'Støtt Prosjektet',
      supportText: 'Prism er et open source-prosjekt. Snart vil du kunne støtte vår utvikling og hjelpe oss med å bygge dette verktøyet for informasjonsdemokrati. (Kommer snart)',
      sponsorGithub: 'Sponsor direkte på GitHub',
      sponsor: 'Sponsor',
      becomePatron: 'Bli månedlig patron',
      patron: 'Bli Patron',
      buyCoffee: 'Kjøp oss en kaffe',
      coffee: 'Kjøp en Kaffe',
      kofiSupport: 'Engangsstøtte eller månedlig',
      kofiBtn: 'Støtt på Ko-fi',
      supportThanks: 'Hvert bidrag, stort som lite, hjelper oss å holde Prism gratis og open source.',
      thanksHeart: '❤️ Takk for din støtte!',
      legalTitle: 'Infrastruktur & Partnere',
      legalText: 'Prism er et open source-prosjekt drevet av forskningslaboratorier og organisasjoner som tror på informasjonsdemokrati. Vi ønsker partnerskap med enheter som deler vår visjon velkommen.',
      legalMonitored: 'Infrastruktur støttet av',
      legalVerified: 'Open Source Prosjekt',
      legalBtn: 'Besøk Lab',
      legalLabName: 'AI-forskningslaboratorium',
      legalBecomeSupporter: 'Bli Supporter',
      legalSupporterText: 'Er din organisasjon interessert i å støtte prosjektet?',
      legalSupporterBtn: 'Bli med som Partner',
      contactTitle: 'Følg og Kontakt Oss',
      contactText: 'Hold deg oppdatert om våre prosjekter og AI-innovasjoner',
      codeAndCoffee: 'Kode & kaffe',
      letsTalk: 'La oss snakke',
      houston: 'Houston, vi har et problem',
      aiLab: 'Laboratorium for Kunstig Intelligens',
      joinTeam: 'Bli med i teamet',
      joinSlogan: 'Vær en del av endringen',
      joinModalTitle: 'Delta i vårt oppdrag',
      joinModalText: 'Koble til med oss for å bli med i teamet',
      joinViaGithub: 'Søk via GitHub',
      joinViaLinkedin: 'Koble til på LinkedIn',
      joinOptionalNote: 'eller legg igjen en melding',
      joinNotePlaceholder: 'Fortell oss om deg selv (valgfritt)',
      comingSoonTitle: 'Kommer snart',
      comingSoonText: 'Vi jobber med å aktivere sponsormuligheter. Snart vil du kunne støtte prosjektet!',
      comingSoonClose: 'Forstått',
      // Docs Modal
      docsTitle: 'Teknisk Dokumentasjon',
      docsVersion: 'Kognitiv Sikkerhetsmotor',
      docsWhatIs: 'Hva er PRISM?',
      docsIntro: 'PRISM er din digitale sannhetsdetektor.',
      docsIntroText: 'I en verden oversvømmet av nyheter, meninger og propaganda er det stadig vanskeligere å skille fakta fra manipulasjon.',
      docsStep1Title: 'Lim inn en Artikkel',
      docsStep1Text: 'Kopier hvilken som helst nyhets-URL fra hvilken som helst kilde i verden',
      docsStep2Title: 'AI-Analyse',
      docsStep2Text: 'Vår motor leser og dekonstruerer narrativet',
      docsStep3Title: 'Få Sannheten',
      docsStep3Text: 'Motta en bias-score, skjulte agendaer og verifiserte fakta',
      docsReveals: 'Hva PRISM Avslører:',
      docsBiasScore: 'Bias-Score (0-100):',
      docsBiasText: 'Hvor manipulativ er artikkelen? 0 = nøytral journalistikk, 100 = ren propaganda',
      docsHiddenInt: 'Skjulte Intensjoner:',
      docsHiddenText: 'Hvorfor ble dette publisert? Hvem drar nytte av at du tror på dette?',
      docsVerifiedFacts: 'Verifiserte Fakta:',
      docsVerifiedText: 'Hva er faktisk sant vs hva er mening eller spin',
      docsManipulation: 'Manipulasjonstaktikker:',
      docsManipText: 'Emosjonelle triggere, logiske feilslutninger og retoriske triks som brukes',
      docsMetaphor: 'Tenk på PRISM som røntgensyn for nyheter. Vi forteller deg ikke hva du skal tenke — vi viser deg hvordan andre prøver å få deg til å tenke.',
      docsTechDetails: 'Tekniske Detaljer',
      docsSystemOverview: 'SYSTEMOVERSIKT',
      docsSystemText1: 'er en kognitiv sikkerhetsplattform designet for',
      docsSystemText2: 'motstandsdyktig tekstanalyse',
      docsSystemText3: 'og',
      docsSystemText4: 'narrativ dekonstruksjon',
      docsSystemText5: 'Opererer på et',
      docsZeroTrust: 'Zero-Trust Logic',
      docsSystemText6: 'rammeverk, systemet antar at hver tekstinput potensielt er designet for å overbevise, manipulere eller tilsløre virkeligheten.',
      docsArchitecture: 'ARKITEKTUR',
      docsFrontend: 'Frontend-Lag',
      docsBackend: 'Backend-Lag',
      docsProtocol: 'OPERASJONELL PROTOKOLL',
      docsSemantic: 'SEMANTISK STRIPPING',
      docsSemanticText: 'Isoler harde fakta fra emosjonell innramming. Trekk ut objektive datapunkter fra subjektive narrative lag.',
      docsNarrative: 'NARRATIV AVKODING',
      docsNarrativeText: 'Identifiser logiske feilslutninger, skjulte aksiomer og manipulative toner. Kartlegg retoriske virkemidler og propagandamønstre.',
      docsIntent: 'INTENSJONSINFERENS',
      docsIntentText: 'Bestem strategisk intensjon: Hvorfor publiseres dette nå? Cui Bono-analyse (hvem drar nytte).',
      docsScoring: 'POENGKALIBRERING',
      docsNeutral: 'NØYTRAL',
      docsNeutralText: 'Tørr rapportering, faktuell, verifiserte kilder (AP/Reuters Wire)',
      docsLeaning: 'HELLENDE',
      docsLeaningText: 'Redigert, lett bias, overbevisende adjektiver',
      docsPropaganda: 'PROPAGANDA',
      docsPropagandaText: 'Tung emosjonell innramming, logiske feilslutninger, tydelig agenda',
      docsWeaponized: 'VÅPENISERT',
      docsWeaponizedText: 'Desinformasjon, psykologisk krigføring, fabrikasjon',
      docsPhantom: 'PHANTOM SCRAPER MODUL',
      docsPhantomText: 'Avansert webuttrekkingsmotor bruker',
      docsPhantomText2: 'headless nettleser med anti-deteksjonsevner:',
      docsShapeshifter: 'Shapeshifter Profiler:',
      docsShapeshifterText: 'Roterer mellom Desktop Chrome, iPhone 14 Pro, Desktop Firefox',
      docsStealth: 'Stealth Injeksjon:',
      docsStealthText: 'Overskriver navigator.webdriver, WebGL fingeravtrykkspoofing',
      docsBioMimicry: 'Bio-Mimicry:',
      docsBioMimicryText: 'Menneskelignende musebevegelser, scrollmønstre, touch-gester',
      docsGoogleBypass: 'Google Consent Bypass:',
      docsGoogleBypassText: 'Automatisk håndtering av cookievegger og interstitials',
      docsGeoint: 'GLOBAL OVERWATCH (GEOINT)',
      docsGeointText: 'Sanntidsinnsamling av etterretning fra',
      docsGeointText2: '35+ geografiske sektorer',
      docsGeointText3: 'via Google News RSS med lokaliserte perspektiver:',
      docsOutput: 'OUTPUT-SKJEMA',
      docsFooter: 'PRISM Kognitiv Sikkerhetsmotor | Open Source Prosjekt',
      docsQuote: 'Demokrati Dør i Mørke. Logikk Overlever i Lyset.'
    },
    it: {
      code: 'IT',
      flag: '🇮🇹',
      name: 'Italiano',
      cognitiveGrid: 'Vedi attraverso la narrativa',
      loginTitle: 'Accedi per continuare',
      continueGoogle: 'Continua con Google',
      continueMicrosoft: 'Continua con Microsoft',
      or: 'oppure',
      guestAccess: 'Entra come Ospite',
      termsText: 'Accedendo accetti i nostri Termini di Servizio e la Privacy Policy',
      scrollMore: 'Scopri di più',
      missionTitle: 'La Nostra Missione',
      missionText1: "In un'era di sovraccarico informativo, distinguere la verità dalla manipolazione è diventato essenziale per la democrazia.",
      missionText2: 'Prism è stato creato per dare ai cittadini il potere di vedere oltre la narrativa. Stiamo costruendo un team di esperti in giornalismo, intelligenza artificiale e cybersecurity uniti da una visione comune.',
      theFounders: 'I Fondatori',
      roleEvangelist: 'Evangelista del Progetto',
      roleAIDev: 'Sviluppatore AI',
      roleDev: 'Full Stack Developer',
      supportTitle: 'Supporta il Progetto',
      supportText: 'Prism è un progetto open source. Presto potrai supportare il nostro sviluppo e aiutarci a costruire questo strumento per la democrazia informativa. (Prossimamente)',
      sponsorGithub: 'Sponsorizza direttamente su GitHub',
      sponsor: 'Sponsorizza',
      becomePatron: 'Diventa un patron mensile',
      patron: 'Diventa Patron',
      buyCoffee: 'Offrici un caffè',
      coffee: 'Offri un Caffè',
      kofiSupport: 'Supporto una tantum o mensile',
      kofiBtn: 'Supporta su Ko-fi',
      supportThanks: 'Ogni contributo, grande o piccolo, ci aiuta a mantenere Prism gratuito e open source.',
      thanksHeart: '❤️ Grazie per il tuo supporto!',
      legalTitle: 'Infrastruttura & Partner',
      legalText: 'Prism è un progetto open source sostenuto da laboratori di ricerca e organizzazioni che credono nella democrazia informativa. Accogliamo partnership con enti che condividono la nostra visione.',
      legalMonitored: 'Infrastruttura supportata da',
      legalVerified: 'Progetto Open Source',
      legalBtn: 'Visita il Lab',
      legalLabName: 'Laboratorio di Ricerca AI',
      legalBecomeSupporter: 'Diventa Supporter',
      legalSupporterText: 'La tua organizzazione è interessata a supportare il progetto?',
      legalSupporterBtn: 'Unisciti come Partner',
      contactTitle: 'Seguici e Contattaci',
      contactText: 'Resta aggiornato sui nostri progetti e innovazioni AI',
      codeAndCoffee: 'Codice & caffè',
      letsTalk: 'Parliamone',
      houston: 'Houston, abbiamo un problema',
      aiLab: 'Laboratorio di Intelligenza Artificiale',
      joinTeam: 'Unisciti al Team',
      joinSlogan: 'Fai parte del cambiamento',
      joinModalTitle: 'Unisciti alla Nostra Missione',
      joinModalText: 'Connettiti con noi per entrare nel team',
      joinViaGithub: 'Candidati via GitHub',
      joinViaLinkedin: 'Connettiti su LinkedIn',
      joinOptionalNote: 'oppure lascia una nota',
      joinNotePlaceholder: 'Parlaci di te (opzionale)',
      comingSoonTitle: 'Prossimamente',
      comingSoonText: 'Stiamo lavorando per attivare le opzioni di sponsorizzazione. Presto potrai supportare il progetto!',
      comingSoonClose: 'Ho capito',
      // Docs Modal
      docsTitle: 'Documentazione Tecnica',
      docsVersion: 'Motore di Sicurezza Cognitiva',
      docsWhatIs: "Cos'è PRISM?",
      docsIntro: 'PRISM è il tuo rilevatore digitale di verità.',
      docsIntroText: "In un mondo inondato di notizie, opinioni e propaganda, è sempre più difficile distinguere i fatti dalla manipolazione.",
      docsStep1Title: 'Incolla un Articolo',
      docsStep1Text: 'Copia qualsiasi URL di notizie da qualsiasi fonte nel mondo',
      docsStep2Title: 'Analisi AI',
      docsStep2Text: 'Il nostro motore legge e decostruisce la narrativa',
      docsStep3Title: 'Ottieni la Verità',
      docsStep3Text: 'Ricevi un punteggio di bias, agende nascoste e fatti verificati',
      docsReveals: 'Cosa Rivela PRISM:',
      docsBiasScore: 'Punteggio Bias (0-100):',
      docsBiasText: "Quanto è manipolativo l'articolo? 0 = giornalismo neutrale, 100 = pura propaganda",
      docsHiddenInt: 'Intenzioni Nascoste:',
      docsHiddenText: 'Perché è stato pubblicato? Chi beneficia dal fatto che tu creda a questo?',
      docsVerifiedFacts: 'Fatti Verificati:',
      docsVerifiedText: "Cosa è veramente vero rispetto a cosa è opinione o spin",
      docsManipulation: 'Tattiche di Manipolazione:',
      docsManipText: 'Trigger emotivi, fallacie logiche e trucchi retorici utilizzati',
      docsMetaphor: "Pensa a PRISM come una visione a raggi X per le notizie. Non ti diciamo cosa pensare — ti mostriamo come altri stanno cercando di farti pensare.",
      docsTechDetails: 'Dettagli Tecnici',
      docsSystemOverview: 'PANORAMICA DEL SISTEMA',
      docsSystemText1: 'è una piattaforma di sicurezza cognitiva progettata per',
      docsSystemText2: "l'analisi testuale avversariale",
      docsSystemText3: 'e',
      docsSystemText4: 'la decostruzione narrativa',
      docsSystemText5: 'Operando su un framework',
      docsZeroTrust: 'Zero-Trust Logic',
      docsSystemText6: 'il sistema assume che ogni input testuale sia potenzialmente progettato per persuadere, manipolare o oscurare la realtà.',
      docsArchitecture: 'ARCHITETTURA',
      docsFrontend: 'Layer Frontend',
      docsBackend: 'Layer Backend',
      docsProtocol: 'PROTOCOLLO OPERATIVO',
      docsSemantic: 'STRIPPING SEMANTICO',
      docsSemanticText: 'Isola i fatti concreti dal framing emotivo. Estrae punti dati oggettivi dai layer narrativi soggettivi.',
      docsNarrative: 'DECODIFICA NARRATIVA',
      docsNarrativeText: 'Identifica fallacie logiche, assiomi nascosti e toni manipolativi. Mappa dispositivi retorici e pattern di propaganda.',
      docsIntent: 'INFERENZA DI INTENTO',
      docsIntentText: "Determina l'intento strategico: Perché viene pubblicato ora? Analisi Cui Bono (chi ne beneficia).",
      docsScoring: 'CALIBRAZIONE PUNTEGGIO',
      docsNeutral: 'NEUTRALE',
      docsNeutralText: 'Reportage asciutto, fattuale, fonti verificate (AP/Reuters Wire)',
      docsLeaning: 'TENDENZIOSO',
      docsLeaningText: 'Editorializzato, leggero bias, aggettivi persuasivi',
      docsPropaganda: 'PROPAGANDA',
      docsPropagandaText: 'Forte framing emotivo, fallacie logiche, agenda chiara',
      docsWeaponized: 'WEAPONIZED',
      docsWeaponizedText: 'Disinformazione, guerra psicologica, fabbricazione',
      docsPhantom: 'MODULO PHANTOM SCRAPER',
      docsPhantomText: 'Motore avanzato di estrazione web usando',
      docsPhantomText2: 'browser headless con capacità anti-rilevamento:',
      docsShapeshifter: 'Profili Shapeshifter:',
      docsShapeshifterText: 'Ruota tra Desktop Chrome, iPhone 14 Pro, Desktop Firefox',
      docsStealth: 'Stealth Injection:',
      docsStealthText: 'Sovrascrive navigator.webdriver, spoofing fingerprint WebGL',
      docsBioMimicry: 'Bio-Mimicry:',
      docsBioMimicryText: 'Movimenti mouse simil-umani, pattern di scroll, gesture touch',
      docsGoogleBypass: 'Google Consent Bypass:',
      docsGoogleBypassText: 'Gestione automatica di cookie wall e interstitial',
      docsGeoint: 'GLOBAL OVERWATCH (GEOINT)',
      docsGeointText: 'Raccolta intelligence in tempo reale da',
      docsGeointText2: '35+ settori geografici',
      docsGeointText3: 'via Google News RSS con prospettive localizzate:',
      docsOutput: 'SCHEMA OUTPUT',
      docsFooter: 'PRISM Cognitive Security Engine | Progetto Open Source',
      docsQuote: 'La Democrazia Muore nel Buio. La Logica Sopravvive nella Luce.'
    }
  };

  const t = translations[language];
  const languages = [
    { code: 'en', flag: '🇬🇧', name: 'English' },
    { code: 'it', flag: '🇮🇹', name: 'Italiano' },
    { code: 'da', flag: '🇩🇰', name: 'Dansk' },
    { code: 'sv', flag: '🇸🇪', name: 'Svenska' },
    { code: 'no', flag: '🇳🇴', name: 'Norsk' }
  ];

  return (
    <div className="bg-black">
      {/* HERO SECTION - Full screen con immagine di sfondo */}
      <div
        className="min-h-screen w-full bg-cover bg-center bg-no-repeat relative bg-fixed"
        style={{ backgroundImage: `url('/strillone-LOra-e1546063219226.jpg')` }}
      >
        {/* Overlay scuro per leggibilità */}
        <div className="absolute inset-0 bg-black/60" />

        {/* HEADER - Fisso in alto a destra, minimalista bianco */}
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
          {/* Docs Button */}
          <button
            onClick={() => setIsDocsModalOpen(true)}
            className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-3 py-2 rounded-lg transition-all duration-200 border border-white/10"
          >
            <FileText className="w-4 h-4 opacity-70" />
            <span className="text-sm font-medium tracking-wide">Docs</span>
          </button>

          {/* Language Menu */}
          <div className="relative">
            {/* Toggle Button - Solo codice lingua */}
            <button
              onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
              className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-3 py-2 rounded-lg transition-all duration-200 border border-white/10"
            >
              <span className="text-sm font-medium uppercase tracking-wide">{translations[language].code}</span>
              <ChevronDown className={`w-3 h-3 opacity-70 transition-transform ${isLangMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu - Minimalista bianco */}
            <AnimatePresence>
              {isLangMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full right-0 mt-1 bg-white/10 backdrop-blur-md border border-white/10 rounded-lg overflow-hidden shadow-lg min-w-[80px]"
                >
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code);
                        setIsLangMenuOpen(false);
                      }}
                      className={`w-full px-4 py-2 text-center transition-all duration-150 ${
                        language === lang.code
                          ? 'bg-white/20 text-white'
                          : 'text-white/70 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <span className="text-sm font-medium uppercase tracking-wide">{lang.code.toUpperCase()}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Contenuto Hero */}
        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">

          {/* Logo e Titolo */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            {/* Icona rotante (identica alla rotella di caricamento) */}
            <div className="mb-6 flex justify-center">
              <Loader className="w-24 h-24 text-[#DC2626] animate-spin" />
            </div>

            <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              PRISM <span className="text-lg md:text-xl font-light italic text-[#DC2626] align-top">beta</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 font-light italic" style={{ fontFamily: 'Lora, serif' }}>
              {t.cognitiveGrid}
            </p>
            <p className="text-sm text-[#DC2626] mt-2 tracking-widest uppercase font-medium">
              Uncover the narrative. Decode the bias.
            </p>
          </motion.div>

          {/* Box Login */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="bg-white/10 backdrop-blur-md rounded-2xl p-8 w-full max-w-md border border-white/20"
          >
            <h2 className="text-xl text-white font-semibold mb-6 text-center">
              {t.loginTitle}
            </h2>

            {/* Google Button */}
            <button
              onClick={() => onLogin('google')}
              className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-100 text-gray-800 font-medium py-3 px-4 rounded-lg mb-4 transition-all duration-200 hover:scale-[1.02]"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {t.continueGoogle}
            </button>

            {/* Microsoft Button */}
            <button
              onClick={() => onLogin('microsoft')}
              className="w-full flex items-center justify-center gap-3 bg-[#2F2F2F] hover:bg-[#404040] text-white font-medium py-3 px-4 rounded-lg mb-4 transition-all duration-200 hover:scale-[1.02]"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#F25022" d="M1 1h10v10H1z"/>
                <path fill="#00A4EF" d="M1 13h10v10H1z"/>
                <path fill="#7FBA00" d="M13 1h10v10H13z"/>
                <path fill="#FFB900" d="M13 13h10v10H13z"/>
              </svg>
              {t.continueMicrosoft}
            </button>

            {/* Divider */}
            <div className="flex items-center my-6">
              <div className="flex-1 border-t border-white/30"></div>
              <span className="px-4 text-gray-400 text-sm">{t.or}</span>
              <div className="flex-1 border-t border-white/30"></div>
            </div>

            {/* Guest Button */}
            <button
              onClick={() => onLogin('guest')}
              className="w-full flex items-center justify-center gap-3 bg-transparent hover:bg-white/10 text-white font-medium py-3 px-4 rounded-lg border-2 border-[#DC2626] transition-all duration-200 hover:scale-[1.02]"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              {t.guestAccess}
            </button>

            <p className="text-xs text-gray-500 text-center mt-6">
              {t.termsText}
            </p>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          >
            <div className="flex flex-col items-center text-gray-400">
              <span className="text-xs uppercase tracking-widest mb-2">{t.scrollMore}</span>
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* SEZIONE MISSIONE - Sfondo nero */}
      <div className="bg-black py-24 px-4">
        <div className="max-w-6xl mx-auto">

          {/* Missione con layout a due colonne */}
          <div className="grid md:grid-cols-2 gap-12 items-center mb-20">

            {/* Colonna sinistra - Testo */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl md:text-5xl font-black text-white mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
                {t.missionTitle}
              </h2>
              <p className="text-xl text-gray-400 mb-6" style={{ fontFamily: 'Lora, serif' }}>
                {t.missionText1}
              </p>
              <p className="text-lg text-gray-500 mb-8" style={{ fontFamily: 'Lora, serif' }}>
                {t.missionText2}
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-1 bg-[#DC2626]"></div>
                <span className="text-[#DC2626] uppercase tracking-widest text-sm font-semibold">{t.theFounders}</span>
              </div>
            </motion.div>

            {/* Colonna destra - Composizione astratta foto */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative h-[500px]"
            >
              {/* Foto 1 - Grande in alto a sinistra - Evangelista */}
              <motion.div
                className="absolute top-0 left-0 w-64 h-64 rounded-2xl overflow-hidden border-4 border-white/10 shadow-2xl z-10"
                whileHover={{ scale: 1.05, zIndex: 30 }}
                transition={{ duration: 0.3 }}
              >
                <img
                  src="/1516274888460.jpeg"
                  alt="Project Evangelist"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-4 text-center">
                  <span className="text-[#DC2626] text-xs uppercase tracking-widest font-semibold">{t.roleEvangelist}</span>
                </div>
              </motion.div>

              {/* Foto 2 - Media in basso a destra - AI Developer */}
              <motion.div
                className="absolute bottom-0 right-0 w-56 h-56 rounded-2xl overflow-hidden border-4 border-[#DC2626]/30 shadow-2xl z-20"
                whileHover={{ scale: 1.05, zIndex: 30 }}
                transition={{ duration: 0.3 }}
              >
                <img
                  src="/1684496683015.jpeg"
                  alt="AI Developer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-3 text-center">
                  <span className="text-[#DC2626] text-xs uppercase tracking-widest font-semibold">{t.roleDev}</span>
                </div>
              </motion.div>

              {/* Foto 3 - Piccola al centro - Full Stack Developer */}
              <motion.div
                className="absolute top-1/2 right-1/4 transform -translate-y-1/2 w-48 h-48 rounded-full overflow-hidden border-4 border-white/20 shadow-2xl z-30"
                whileHover={{ scale: 1.1, zIndex: 40 }}
                transition={{ duration: 0.3 }}
              >
                <img
                  src="/1758023934673.jpeg"
                  alt="Full Stack Developer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                <div className="absolute bottom-4 left-0 right-0 text-center">
                  <span className="text-[#DC2626] text-[10px] uppercase tracking-widest font-semibold">{t.roleAIDev}</span>
                </div>
              </motion.div>

              {/* Join Team Card - Quadrato cliccabile */}
              <motion.button
                onClick={() => setIsJoinModalOpen(true)}
                className="absolute bottom-10 left-10 w-40 h-40 rounded-2xl bg-gradient-to-br from-[#DC2626] to-[#991b1b] border-2 border-[#DC2626] shadow-2xl z-20 flex flex-col items-center justify-center cursor-pointer overflow-hidden group"
                whileHover={{ scale: 1.08, zIndex: 40 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                <svg className="w-10 h-10 text-white mb-2 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                <span className="text-white font-bold text-sm text-center px-2 relative z-10">{t.joinTeam}</span>
                <span className="text-white/70 text-xs text-center px-2 mt-1 relative z-10">{t.joinSlogan}</span>
              </motion.button>

              {/* Elementi decorativi */}
              <div className="absolute top-10 right-10 w-32 h-32 border-2 border-[#DC2626]/20 rounded-full"></div>
              <div className="absolute bottom-20 left-20 w-24 h-24 border border-white/10 rounded-lg rotate-12"></div>
              <div className="absolute top-1/3 left-1/2 w-16 h-16 bg-[#DC2626]/10 rounded-full blur-xl"></div>
            </motion.div>
          </div>

          {/* Divider */}
          <div className="mt-24 mb-16 flex items-center justify-center">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
          </div>

          {/* SEZIONE SPONSORIZZAZIONI */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mb-24"
          >
            {/* Header */}
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-white mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
                {t.supportTitle}
              </h3>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                {t.supportText}
              </p>
            </div>

            {/* Sponsor Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">

              {/* GitHub Sponsors */}
              <motion.button
                onClick={() => setIsComingSoonOpen(true)}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="bg-gradient-to-br from-[#1a1a2e] to-[#0d0d1a] border border-white/10 rounded-2xl p-6 hover:border-[#DC2626]/50 hover:scale-105 transition-all duration-300 group text-center cursor-pointer"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-[#DC2626]/20 transition-colors">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </div>
                <h4 className="text-white font-bold text-lg mb-2">GitHub Sponsors</h4>
                <p className="text-gray-500 text-sm mb-4">{t.sponsorGithub}</p>
                <span className="inline-block px-4 py-2 bg-[#DC2626]/20 text-[#DC2626] rounded-full text-sm font-medium">
                  {t.sponsor}
                </span>
              </motion.button>

              {/* Patreon */}
              <motion.button
                onClick={() => setIsComingSoonOpen(true)}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-gradient-to-br from-[#1a1a2e] to-[#0d0d1a] border border-white/10 rounded-2xl p-6 hover:border-[#f96854]/50 hover:scale-105 transition-all duration-300 group text-center cursor-pointer"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-[#f96854]/20 transition-colors">
                  <svg className="w-8 h-8 text-[#f96854]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M15.386.524c-4.764 0-8.64 3.876-8.64 8.64 0 4.75 3.876 8.613 8.64 8.613 4.75 0 8.614-3.864 8.614-8.613C24 4.4 20.136.524 15.386.524M.003 23.537h4.22V.524H.003"/>
                  </svg>
                </div>
                <h4 className="text-white font-bold text-lg mb-2">Patreon</h4>
                <p className="text-gray-500 text-sm mb-4">{t.becomePatron}</p>
                <span className="inline-block px-4 py-2 bg-[#f96854]/20 text-[#f96854] rounded-full text-sm font-medium">
                  {t.patron}
                </span>
              </motion.button>

              {/* Buy Me a Coffee */}
              <motion.button
                onClick={() => setIsComingSoonOpen(true)}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-gradient-to-br from-[#1a1a2e] to-[#0d0d1a] border border-white/10 rounded-2xl p-6 hover:border-[#FFDD00]/50 hover:scale-105 transition-all duration-300 group text-center cursor-pointer"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-[#FFDD00]/20 transition-colors">
                  <svg className="w-8 h-8 text-[#FFDD00]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.216 6.415l-.132-.666c-.119-.598-.388-1.163-1.001-1.379-.197-.069-.42-.098-.57-.241-.152-.143-.196-.366-.231-.572-.065-.378-.125-.756-.192-1.133-.057-.325-.102-.69-.25-.987-.195-.4-.597-.634-.996-.788a5.723 5.723 0 00-.626-.194c-1-.263-2.05-.36-3.077-.416a25.834 25.834 0 00-3.7.062c-.915.083-1.88.184-2.75.5-.318.116-.646.256-.888.501-.297.302-.393.77-.177 1.146.154.267.415.456.692.58.36.162.737.284 1.123.366 1.075.238 2.189.331 3.287.37 1.218.05 2.437.01 3.65-.118.299-.033.598-.073.896-.119.352-.054.578-.513.474-.834-.124-.383-.457-.531-.834-.473-.466.074-.96.108-1.382.146-1.177.08-2.358.082-3.536.006a22.228 22.228 0 01-1.157-.107c-.086-.01-.18-.025-.258-.036-.243-.036-.484-.08-.724-.13-.111-.027-.111-.185 0-.212h.005c.277-.06.557-.108.838-.147h.002c.131-.009.263-.032.394-.048a25.076 25.076 0 013.426-.12c.674.019 1.347.067 2.017.144l.228.031c.267.04.533.088.798.145.392.085.895.113 1.07.542.055.137.08.288.111.431l.319 1.484a.237.237 0 01-.199.284h-.003c-.037.006-.075.01-.112.015a36.704 36.704 0 01-4.743.295 37.059 37.059 0 01-4.699-.304c-.14-.017-.293-.042-.417-.06-.326-.048-.649-.108-.973-.161-.393-.065-.768-.032-1.123.161-.29.16-.527.404-.675.701-.154.316-.199.66-.267 1-.069.34-.176.707-.135 1.056.087.753.613 1.365 1.37 1.502a39.69 39.69 0 0011.343.376.483.483 0 01.535.53l-.071.697-1.018 9.907c-.041.41-.047.832-.125 1.237-.122.637-.553 1.028-1.182 1.171-.577.131-1.165.2-1.756.205-.656.004-1.31-.025-1.966-.022-.699.004-1.556-.06-2.095-.58-.475-.458-.54-1.174-.605-1.793l-.731-7.013-.322-3.094c-.037-.351-.286-.695-.678-.678-.336.015-.718.3-.678.679l.228 2.185.949 9.112c.147 1.344 1.174 2.068 2.446 2.272.742.12 1.503.144 2.257.156.966.016 1.942.053 2.892-.122 1.408-.258 2.465-1.198 2.616-2.657.34-3.332.683-6.663 1.024-9.995l.215-2.087a.484.484 0 01.39-.426c.402-.078.787-.212 1.074-.518.455-.488.546-1.124.385-1.766zm-1.478.772c-.145.137-.363.201-.578.233-2.416.359-4.866.54-7.308.46-1.748-.06-3.477-.254-5.207-.498-.17-.024-.353-.055-.47-.18-.22-.236-.111-.71-.054-.995.052-.26.152-.609.463-.646.484-.057 1.046.148 1.526.22.577.088 1.156.159 1.737.212 2.48.226 5.002.19 7.472-.14.45-.06.899-.13 1.345-.21.399-.072.84-.206 1.08.206.166.281.188.657.162.974a.544.544 0 01-.169.364z"/>
                  </svg>
                </div>
                <h4 className="text-white font-bold text-lg mb-2">Buy Me a Coffee</h4>
                <p className="text-gray-500 text-sm mb-4">{t.buyCoffee}</p>
                <span className="inline-block px-4 py-2 bg-[#FFDD00]/20 text-[#FFDD00] rounded-full text-sm font-medium">
                  {t.coffee}
                </span>
              </motion.button>

              {/* Ko-fi */}
              <motion.button
                onClick={() => setIsComingSoonOpen(true)}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-gradient-to-br from-[#1a1a2e] to-[#0d0d1a] border border-white/10 rounded-2xl p-6 hover:border-[#FF5E5B]/50 hover:scale-105 transition-all duration-300 group text-center cursor-pointer"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-[#FF5E5B]/20 transition-colors">
                  <svg className="w-8 h-8 text-[#FF5E5B]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.881 8.948c-.773-4.085-4.859-4.593-4.859-4.593H.723c-.604 0-.679.798-.679.798s-.082 7.324-.022 11.822c.164 2.424 2.586 2.672 2.586 2.672s8.267-.023 11.966-.049c2.438-.426 2.683-2.566 2.658-3.734 4.352.24 7.422-2.831 6.649-6.916zm-11.062 3.511c-1.246 1.453-4.011 3.976-4.011 3.976s-.121.119-.31.023c-.076-.057-.108-.09-.108-.09-.443-.441-3.368-3.049-4.034-3.954-.709-.965-1.041-2.7-.091-3.71.951-1.01 3.005-1.086 4.363.407 0 0 1.565-1.782 3.468-.963 1.904.82 1.832 3.011.723 4.311zm6.173.478c-.928.116-1.682.028-1.682.028V7.284h1.77s1.971.551 1.971 2.638c0 1.913-.985 2.667-2.059 3.015z"/>
                  </svg>
                </div>
                <h4 className="text-white font-bold text-lg mb-2">Ko-fi</h4>
                <p className="text-gray-500 text-sm mb-4">{t.kofiSupport}</p>
                <span className="inline-block px-4 py-2 bg-[#FF5E5B]/20 text-[#FF5E5B] rounded-full text-sm font-medium">
                  {t.kofiBtn}
                </span>
              </motion.button>
            </div>

            {/* Messaggio aggiuntivo */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mt-12 text-center"
            >
              <p className="text-gray-500 text-sm">
                {t.supportThanks}
              </p>
              <p className="text-[#DC2626] text-sm mt-2 font-medium">
                {t.thanksHeart}
              </p>
            </motion.div>
          </motion.div>

          {/* Divider */}
          <div className="my-16 flex items-center justify-center">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
          </div>

          {/* SEZIONE TRASPARENZA LEGALE */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mb-24"
          >
            <div className="bg-gradient-to-br from-[#0a1628] to-[#1a1a2e] border border-[#DC2626]/20 rounded-3xl p-8 md:p-12 relative overflow-hidden">
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#DC2626]/5 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#DC2626]/5 rounded-full blur-2xl"></div>

              <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
                {/* Left - Text content */}
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-[#DC2626]/20 flex items-center justify-center">
                      <svg className="w-5 h-5 text-[#DC2626]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                      {t.legalTitle}
                    </h3>
                  </div>

                  <p className="text-gray-400 text-lg mb-6 leading-relaxed">
                    {t.legalText}
                  </p>

                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>{t.legalVerified}</span>
                  </div>
                </div>

                {/* Right - Two Cards */}
                <div className="flex flex-col gap-4">
                  {/* UnityLoop Card */}
                  <div className="bg-black/40 border border-white/10 rounded-2xl p-5 text-center">
                    <p className="text-gray-400 text-xs mb-2 uppercase tracking-wider">{t.legalMonitored}</p>

                    <p className="text-white font-bold text-lg mb-1">unityloop.ai</p>
                    <p className="text-gray-500 text-xs mb-3">{t.legalLabName}</p>

                    <a
                      href="https://www.unityloop.ai/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-[#DC2626] hover:bg-[#b91c1c] text-white font-medium px-4 py-2 rounded-lg text-sm transition-all duration-300 hover:scale-105"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      {t.legalBtn}
                    </a>
                  </div>

                  {/* Become Supporter Card */}
                  <div className="bg-black/40 border border-[#DC2626]/20 rounded-2xl p-5 text-center">
                    <p className="text-[#DC2626] text-xs mb-2 uppercase tracking-wider font-semibold">{t.legalBecomeSupporter}</p>
                    <p className="text-gray-400 text-sm mb-3">{t.legalSupporterText}</p>

                    <a
                      href="mailto:contact@unityloop.ai?subject=Partnership%20Inquiry%20-%20Prism"
                      className="inline-flex items-center gap-2 bg-transparent border border-[#DC2626] hover:bg-[#DC2626]/10 text-[#DC2626] font-medium px-4 py-2 rounded-lg text-sm transition-all duration-300"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      {t.legalSupporterBtn}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Divider */}
          <div className="mb-16 flex items-center justify-center">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
          </div>

          {/* Follow and Contact Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h3 className="text-3xl font-bold text-white mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              {t.contactTitle}
            </h3>
            <p className="text-gray-400 text-lg">
              {t.contactText}
            </p>
          </motion.div>

          {/* Contact Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-20">
            {/* GitHub */}
            <motion.a
              href="https://github.com/unityloop"
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-[#DC2626]/50 hover:bg-white/10 transition-all duration-300 group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-[#DC2626]/20 transition-colors">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </div>
                <div>
                  <h4 className="text-white font-semibold text-lg">GitHub</h4>
                  <p className="text-gray-400 text-sm">{t.codeAndCoffee}</p>
                </div>
              </div>
            </motion.a>

            {/* LinkedIn */}
            <motion.a
              href="https://linkedin.com/company/unityloop"
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-[#DC2626]/50 hover:bg-white/10 transition-all duration-300 group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-[#DC2626]/20 transition-colors">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </div>
                <div>
                  <h4 className="text-white font-semibold text-lg">LinkedIn</h4>
                  <p className="text-gray-400 text-sm">{t.letsTalk}</p>
                </div>
              </div>
            </motion.a>

            {/* Email */}
            <motion.a
              href="mailto:contact@unityloop.ai"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-[#DC2626]/50 hover:bg-white/10 transition-all duration-300 group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-[#DC2626]/20 transition-colors">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-white font-semibold text-lg">Email</h4>
                  <p className="text-gray-400 text-sm">{t.houston}</p>
                </div>
              </div>
            </motion.a>
          </div>

          {/* Footer */}
          <div className="pt-12 border-t border-white/10">
            <div className="flex flex-col items-center">
              {/* PRISM Logo */}
              <div className="mb-6 text-center">
                <Loader className="w-10 h-10 text-[#DC2626] animate-spin mx-auto mb-3" />
                <h3 className="text-2xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                  PRISM
                </h3>
                <p className="text-gray-500 text-sm mt-1">{t.cognitiveGrid}</p>
              </div>

              {/* Copyright */}
              <div className="text-center">
                <p className="text-gray-600 text-sm">
                  PRISM - 2025
                </p>
                <p className="text-gray-700 text-xs mt-2 italic">
                  "Democracy Dies in Darkness • Logic Survives in Light"
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* JOIN TEAM MODAL */}
      <AnimatePresence>
        {isJoinModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setIsJoinModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3 }}
              className="bg-gradient-to-br from-[#1a1a2e] to-[#0d0d1a] border border-[#DC2626]/30 rounded-2xl p-8 w-full max-w-md relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={() => setIsJoinModalOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Header */}
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Loader className="w-12 h-12 text-[#DC2626] animate-spin" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                  {t.joinModalTitle}
                </h3>
                <p className="text-gray-400 text-sm">
                  {t.joinModalText}
                </p>
              </div>

              {/* Quick Apply Buttons */}
              <div className="space-y-3 mb-6">
                {/* GitHub Button */}
                <a
                  href="https://github.com/UnityLoop-official/SHADOW-ANALYZER/issues/new?template=join-team.md&title=Join+Team+Application"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-3 bg-[#24292e] hover:bg-[#2f363d] text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 hover:scale-[1.02]"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  {t.joinViaGithub}
                </a>

                {/* LinkedIn Button */}
                <a
                  href="https://www.linkedin.com/company/unityloop"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-3 bg-[#0A66C2] hover:bg-[#004182] text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 hover:scale-[1.02]"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  {t.joinViaLinkedin}
                </a>
              </div>

              {/* Divider */}
              <div className="flex items-center my-4">
                <div className="flex-1 border-t border-white/10"></div>
                <span className="px-3 text-gray-500 text-xs">{t.joinOptionalNote}</span>
                <div className="flex-1 border-t border-white/10"></div>
              </div>

              {/* Optional Note */}
              <div>
                <textarea
                  id="joinNote"
                  rows={2}
                  placeholder={t.joinNotePlaceholder}
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-[#DC2626] focus:outline-none transition-colors resize-none text-sm"
                ></textarea>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* COMING SOON MODAL */}
      <AnimatePresence>
        {isComingSoonOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setIsComingSoonOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.2 }}
              className="bg-gradient-to-br from-[#1a1a2e] to-[#0d0d1a] border border-[#DC2626]/30 rounded-2xl p-6 w-full max-w-sm text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-14 h-14 mx-auto mb-4 flex items-center justify-center">
                <Loader className="w-10 h-10 text-[#DC2626] animate-spin" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                {t.comingSoonTitle}
              </h3>
              <p className="text-gray-400 text-sm mb-5">
                {t.comingSoonText}
              </p>
              <button
                onClick={() => setIsComingSoonOpen(false)}
                className="bg-[#DC2626] hover:bg-[#b91c1c] text-white font-medium py-2 px-6 rounded-lg transition-all duration-200"
              >
                {t.comingSoonClose}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DOCS MODAL - Technical Documentation */}
      <AnimatePresence>
        {isDocsModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setIsDocsModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3 }}
              className="bg-[#0a0a0f] border border-[#DC2626]/30 rounded-2xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto relative my-8"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header with close and language selector */}
              <div className="flex items-center justify-between mb-6">
                {/* Language Selector */}
                <div className="flex items-center gap-1">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => setLanguage(lang.code)}
                      className={`px-2 py-1 text-xs font-medium rounded transition-all ${
                        language === lang.code
                          ? 'bg-[#DC2626] text-white'
                          : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {lang.code.toUpperCase()}
                    </button>
                  ))}
                </div>
                {/* Close button */}
                <button
                  onClick={() => setIsDocsModalOpen(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Header */}
              <div className="mb-8 border-b border-white/10 pb-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-[#DC2626]/20 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-[#DC2626]" />
                  </div>
                  <h2 className="text-2xl font-bold text-white font-mono">PRISM // {t.docsTitle}</h2>
                </div>
                <p className="text-gray-500 text-sm font-mono">v1.0.0 | {t.docsVersion}</p>
              </div>

              {/* Content */}
              <div className="space-y-8 text-gray-300 text-sm leading-relaxed">

                {/* FOR EVERYONE - Non-technical explanation */}
                <section className="bg-gradient-to-br from-[#DC2626]/10 to-transparent border border-[#DC2626]/20 rounded-xl p-6">
                  <h3 className="text-white text-xl font-bold mb-4 flex items-center gap-2">
                    <span className="text-2xl">🔍</span> {t.docsWhatIs}
                  </h3>
                  <div className="space-y-4 text-gray-300 font-sans">
                    <p className="text-base leading-relaxed">
                      <span className="text-white font-semibold">{t.docsIntro}</span> {t.docsIntroText}
                    </p>

                    <div className="grid md:grid-cols-3 gap-4 my-6">
                      <div className="bg-black/30 rounded-lg p-4 text-center">
                        <div className="text-3xl mb-2">📰</div>
                        <h4 className="text-white font-semibold mb-1">{t.docsStep1Title}</h4>
                        <p className="text-gray-400 text-xs">{t.docsStep1Text}</p>
                      </div>
                      <div className="bg-black/30 rounded-lg p-4 text-center">
                        <div className="text-3xl mb-2">🧠</div>
                        <h4 className="text-white font-semibold mb-1">{t.docsStep2Title}</h4>
                        <p className="text-gray-400 text-xs">{t.docsStep2Text}</p>
                      </div>
                      <div className="bg-black/30 rounded-lg p-4 text-center">
                        <div className="text-3xl mb-2">📊</div>
                        <h4 className="text-white font-semibold mb-1">{t.docsStep3Title}</h4>
                        <p className="text-gray-400 text-xs">{t.docsStep3Text}</p>
                      </div>
                    </div>

                    <div className="bg-black/40 rounded-lg p-4 border-l-4 border-[#DC2626]">
                      <h4 className="text-white font-semibold mb-2">🎯 {t.docsReveals}</h4>
                      <ul className="space-y-2 text-gray-300">
                        <li className="flex items-start gap-2">
                          <span className="text-[#DC2626]">•</span>
                          <span><strong className="text-white">{t.docsBiasScore}</strong> {t.docsBiasText}</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-[#DC2626]">•</span>
                          <span><strong className="text-white">{t.docsHiddenInt}</strong> {t.docsHiddenText}</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-[#DC2626]">•</span>
                          <span><strong className="text-white">{t.docsVerifiedFacts}</strong> {t.docsVerifiedText}</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-[#DC2626]">•</span>
                          <span><strong className="text-white">{t.docsManipulation}</strong> {t.docsManipText}</span>
                        </li>
                      </ul>
                    </div>

                    <p className="text-gray-400 text-sm italic mt-4">
                      {t.docsMetaphor}
                    </p>
                  </div>
                </section>

                {/* Divider */}
                <div className="flex items-center gap-4 py-2">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                  <span className="text-gray-500 text-xs uppercase tracking-widest font-mono">{t.docsTechDetails}</span>
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                </div>

                {/* System Overview */}
                <section>
                  <h3 className="text-[#DC2626] text-lg font-bold mb-3 flex items-center gap-2 font-mono">
                    <span className="text-white/30">//</span> SYSTEM OVERVIEW
                  </h3>
                  <div className="bg-black/50 border border-white/5 rounded-lg p-4">
                    <p className="mb-3">
                      <span className="text-[#DC2626]">PRISM</span> is a cognitive security platform designed for
                      <span className="text-white"> adversarial text analysis</span> and
                      <span className="text-white"> narrative deconstruction</span>.
                    </p>
                    <p>
                      Operating on a <span className="text-yellow-500">Zero-Trust Logic</span> framework, the system assumes
                      every text input is potentially designed to persuade, manipulate, or obscure reality.
                    </p>
                  </div>
                </section>

                {/* Architecture */}
                <section>
                  <h3 className="text-[#DC2626] text-lg font-bold mb-3 flex items-center gap-2">
                    <span className="text-white/30">//</span> ARCHITECTURE
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-black/50 border border-white/5 rounded-lg p-4">
                      <h4 className="text-white font-bold mb-2">Frontend Layer</h4>
                      <ul className="space-y-1 text-gray-400">
                        <li>• React 19 + Vite 7</li>
                        <li>• Framer Motion (animations)</li>
                        <li>• TailwindCSS (styling)</li>
                        <li>• Zustand (state management)</li>
                        <li>• React Three Fiber (3D visualizations)</li>
                      </ul>
                    </div>
                    <div className="bg-black/50 border border-white/5 rounded-lg p-4">
                      <h4 className="text-white font-bold mb-2">Backend Layer</h4>
                      <ul className="space-y-1 text-gray-400">
                        <li>• FastAPI (Python async server)</li>
                        <li>• Playwright (headless browser)</li>
                        <li>• BeautifulSoup4 (HTML parsing)</li>
                        <li>• OpenAI GPT-4o (inference engine)</li>
                        <li>• Google News RSS (GEOINT feed)</li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* Operational Protocol */}
                <section>
                  <h3 className="text-[#DC2626] text-lg font-bold mb-3 flex items-center gap-2">
                    <span className="text-white/30">//</span> OPERATIONAL PROTOCOL
                  </h3>
                  <div className="bg-black/50 border border-white/5 rounded-lg p-4 space-y-4">
                    <div>
                      <h4 className="text-white font-bold mb-1">1. SEMANTIC STRIPPING</h4>
                      <p className="text-gray-400">Isolate hard facts from emotional framing. Extract objective data points from subjective narrative layers.</p>
                    </div>
                    <div>
                      <h4 className="text-white font-bold mb-1">2. NARRATIVE DECODING</h4>
                      <p className="text-gray-400">Identify logical fallacies, hidden axioms, and manipulative tones. Map rhetorical devices and propaganda patterns.</p>
                    </div>
                    <div>
                      <h4 className="text-white font-bold mb-1">3. INTENT INFERENCE</h4>
                      <p className="text-gray-400">Determine strategic intent: Why is this being published now? Cui Bono analysis (who benefits).</p>
                    </div>
                  </div>
                </section>

                {/* Scoring Calibration */}
                <section>
                  <h3 className="text-[#DC2626] text-lg font-bold mb-3 flex items-center gap-2">
                    <span className="text-white/30">//</span> SCORING CALIBRATION
                  </h3>
                  <div className="space-y-2">
                    <div className="bg-black/50 border border-green-500/20 rounded-lg p-3 flex items-center gap-4">
                      <span className="text-green-500 font-bold w-20">0-20</span>
                      <span className="text-white font-bold">NEUTRAL</span>
                      <span className="text-gray-400">Dry reporting, factual, verified sources (AP/Reuters Wire)</span>
                    </div>
                    <div className="bg-black/50 border border-yellow-500/20 rounded-lg p-3 flex items-center gap-4">
                      <span className="text-yellow-500 font-bold w-20">21-50</span>
                      <span className="text-white font-bold">LEANING</span>
                      <span className="text-gray-400">Editorialized, slight bias, persuasive adjectives</span>
                    </div>
                    <div className="bg-black/50 border border-orange-500/20 rounded-lg p-3 flex items-center gap-4">
                      <span className="text-orange-500 font-bold w-20">51-79</span>
                      <span className="text-white font-bold">PROPAGANDA</span>
                      <span className="text-gray-400">Heavy emotional framing, logical fallacies, clear agenda</span>
                    </div>
                    <div className="bg-black/50 border border-red-500/20 rounded-lg p-3 flex items-center gap-4">
                      <span className="text-red-500 font-bold w-20">80-100</span>
                      <span className="text-white font-bold">WEAPONIZED</span>
                      <span className="text-gray-400">Disinformation, psychological warfare, fabrication</span>
                    </div>
                  </div>
                </section>

                {/* Phantom Scraper */}
                <section>
                  <h3 className="text-[#DC2626] text-lg font-bold mb-3 flex items-center gap-2">
                    <span className="text-white/30">//</span> PHANTOM SCRAPER MODULE
                  </h3>
                  <div className="bg-black/50 border border-white/5 rounded-lg p-4">
                    <p className="mb-3">
                      Advanced web extraction engine using <span className="text-white">Playwright</span> headless browser
                      with anti-detection capabilities:
                    </p>
                    <ul className="space-y-2 text-gray-400">
                      <li>• <span className="text-white">Shapeshifter Profiles:</span> Rotates between Desktop Chrome, iPhone 14 Pro, Desktop Firefox</li>
                      <li>• <span className="text-white">Stealth Injection:</span> Overwrites navigator.webdriver, WebGL fingerprint spoofing</li>
                      <li>• <span className="text-white">Bio-Mimicry:</span> Human-like mouse movements, scroll patterns, touch gestures</li>
                      <li>• <span className="text-white">Google Consent Bypass:</span> Automatic handling of cookie walls and interstitials</li>
                    </ul>
                  </div>
                </section>

                {/* GEOINT Module */}
                <section>
                  <h3 className="text-[#DC2626] text-lg font-bold mb-3 flex items-center gap-2">
                    <span className="text-white/30">//</span> GLOBAL OVERWATCH (GEOINT)
                  </h3>
                  <div className="bg-black/50 border border-white/5 rounded-lg p-4">
                    <p className="mb-3">
                      Real-time intelligence gathering from <span className="text-white">35+ geographic sectors</span> via
                      Google News RSS with localized perspectives:
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                      <span className="bg-white/5 px-2 py-1 rounded">North America</span>
                      <span className="bg-white/5 px-2 py-1 rounded">Europe</span>
                      <span className="bg-white/5 px-2 py-1 rounded">Asia Pacific</span>
                      <span className="bg-white/5 px-2 py-1 rounded">Middle East</span>
                      <span className="bg-white/5 px-2 py-1 rounded">Latin America</span>
                      <span className="bg-white/5 px-2 py-1 rounded">Africa</span>
                      <span className="bg-white/5 px-2 py-1 rounded">Scandinavia</span>
                      <span className="bg-white/5 px-2 py-1 rounded">Baltic States</span>
                    </div>
                  </div>
                </section>

                {/* Output Schema */}
                <section>
                  <h3 className="text-[#DC2626] text-lg font-bold mb-3 flex items-center gap-2">
                    <span className="text-white/30">//</span> OUTPUT SCHEMA
                  </h3>
                  <div className="bg-black/50 border border-white/5 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-xs text-gray-400">
{`{
  "title": "Analyzed Title",
  "meta": {
    "score": Integer 0-100,
    "verdict_short": "Max 5 words verdict",
    "tone": "Alarmist | Neutral | Persuasive | ..."
  },
  "intent": "Strategic intent explanation (2 sentences)",
  "narrative_analysis": "Long-form forensic analysis (500-800 words)",
  "facts": ["Extracted fact 1", "Extracted fact 2", ...],
  "axioms": ["Hidden premise 1", "Omitted context 1", ...]
}`}
                    </pre>
                  </div>
                </section>

                {/* Footer */}
                <div className="pt-6 border-t border-white/10 text-center">
                  <p className="text-gray-500 text-xs">
                    PRISM Cognitive Security Engine | Open Source Project
                  </p>
                  <p className="text-[#DC2626] text-xs mt-1 italic">
                    "Democracy Dies in Darkness. Logic Survives in Light."
                  </p>
                </div>

              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LandingPage;
