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
            className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 active:bg-white/30 backdrop-blur-md text-white px-3 py-2.5 rounded-lg transition-all duration-200 border border-white/10 touch-manipulation min-h-[44px]"
          >
            <FileText className="w-4 h-4 opacity-70" />
            <span className="text-sm font-medium tracking-wide">Docs</span>
          </button>

          {/* Language Menu */}
          <div className="relative">
            {/* Toggle Button - Solo codice lingua */}
            <button
              onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
              className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 active:bg-white/30 backdrop-blur-md text-white px-3 py-2.5 rounded-lg transition-all duration-200 border border-white/10 touch-manipulation min-h-[44px]"
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

      {/* DOCS MODAL - Minimal Editorial Style */}
      <AnimatePresence>
        {isDocsModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#0d0d0d] z-50 overflow-hidden"
            onClick={() => setIsDocsModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="h-full w-full flex"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Sidebar Navigation */}
              <aside className="hidden md:flex flex-col w-56 border-r border-white/5 bg-[#0a0a0a] p-6">
                {/* Logo */}
                <div className="mb-8">
                  <h1 className="text-white text-lg tracking-wider" style={{ fontFamily: 'Georgia, serif' }}>PRISM</h1>
                  <p className="text-gray-600 text-xs mt-1">v1.0.0</p>
                </div>

                {/* Language Selector */}
                <div className="flex gap-1 mb-8 flex-wrap">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => setLanguage(lang.code)}
                      className={`px-2 py-1 text-xs transition-all ${
                        language === lang.code
                          ? 'text-white border-b border-white'
                          : 'text-gray-500 hover:text-gray-300'
                      }`}
                    >
                      {lang.code.toUpperCase()}
                    </button>
                  ))}
                </div>

                {/* Navigation */}
                <nav className="space-y-1 flex-1">
                  <a href="#overview" className="block text-gray-400 hover:text-white text-sm py-2 transition-colors">{t.docsWhatIs}</a>
                  <a href="#how-it-works" className="block text-gray-400 hover:text-white text-sm py-2 transition-colors">How it works</a>
                  <div className="h-px bg-white/5 my-3"></div>
                  <p className="text-gray-600 text-xs uppercase tracking-wider mb-2">Technical</p>
                  <a href="#architecture" className="block text-gray-500 hover:text-white text-xs py-1.5 transition-colors">Architecture</a>
                  <a href="#protocol" className="block text-gray-500 hover:text-white text-xs py-1.5 transition-colors">Protocol</a>
                  <a href="#scoring" className="block text-gray-500 hover:text-white text-xs py-1.5 transition-colors">Scoring</a>
                  <a href="#scraper" className="block text-gray-500 hover:text-white text-xs py-1.5 transition-colors">Scraper</a>
                  <a href="#geoint" className="block text-gray-500 hover:text-white text-xs py-1.5 transition-colors">GEOINT</a>
                  <a href="#output" className="block text-gray-500 hover:text-white text-xs py-1.5 transition-colors">Output</a>
                </nav>

                {/* Footer */}
                <div className="text-gray-600 text-xs">
                  Open Source
                </div>
              </aside>

              {/* Main Content */}
              <main className="flex-1 overflow-y-auto">
                {/* Mobile Header */}
                <div className="md:hidden flex items-center justify-between p-4 border-b border-white/5">
                  <h1 className="text-white text-lg" style={{ fontFamily: 'Georgia, serif' }}>PRISM</h1>
                  <div className="flex items-center gap-4">
                    <div className="flex gap-1">
                      {languages.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => setLanguage(lang.code)}
                          className={`px-1.5 py-0.5 text-xs ${
                            language === lang.code ? 'text-white' : 'text-gray-500'
                          }`}
                        >
                          {lang.code.toUpperCase()}
                        </button>
                      ))}
                    </div>
                    <button onClick={() => setIsDocsModalOpen(false)} className="text-gray-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Close button desktop */}
                <button
                  onClick={() => setIsDocsModalOpen(false)}
                  className="hidden md:block absolute top-6 right-6 text-gray-500 hover:text-white transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                {/* Content */}
                <div className="max-w-2xl mx-auto px-6 py-12 md:py-16">

                  {/* Overview Section */}
                  <section id="overview" className="mb-16">
                    <h2 className="text-white text-3xl md:text-4xl font-light mb-6" style={{ fontFamily: 'Georgia, serif' }}>
                      {t.docsWhatIs}
                    </h2>
                    <p className="text-gray-400 text-lg leading-relaxed mb-6" style={{ fontFamily: 'Georgia, serif' }}>
                      {t.docsIntro}
                    </p>
                    <p className="text-gray-500 leading-relaxed">
                      {t.docsIntroText}
                    </p>
                  </section>

                  {/* How it works */}
                  <section id="how-it-works" className="mb-16">
                    <h3 className="text-gray-300 text-sm uppercase tracking-widest mb-8">How it works</h3>

                    <div className="space-y-8">
                      <div className="flex gap-6">
                        <div className="text-gray-600 text-sm w-8 shrink-0">01</div>
                        <div>
                          <h4 className="text-white mb-2">{t.docsStep1Title}</h4>
                          <p className="text-gray-500 text-sm">{t.docsStep1Text}</p>
                        </div>
                      </div>
                      <div className="flex gap-6">
                        <div className="text-gray-600 text-sm w-8 shrink-0">02</div>
                        <div>
                          <h4 className="text-white mb-2">{t.docsStep2Title}</h4>
                          <p className="text-gray-500 text-sm">{t.docsStep2Text}</p>
                        </div>
                      </div>
                      <div className="flex gap-6">
                        <div className="text-gray-600 text-sm w-8 shrink-0">03</div>
                        <div>
                          <h4 className="text-white mb-2">{t.docsStep3Title}</h4>
                          <p className="text-gray-500 text-sm">{t.docsStep3Text}</p>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* What PRISM Reveals */}
                  <section className="mb-16 border-l border-white/10 pl-6">
                    <h3 className="text-gray-300 text-sm uppercase tracking-widest mb-6">{t.docsReveals}</h3>
                    <ul className="space-y-4 text-gray-400">
                      <li><span className="text-white">{t.docsBiasScore}</span> {t.docsBiasText}</li>
                      <li><span className="text-white">{t.docsHiddenInt}</span> {t.docsHiddenText}</li>
                      <li><span className="text-white">{t.docsVerifiedFacts}</span> {t.docsVerifiedText}</li>
                      <li><span className="text-white">{t.docsManipulation}</span> {t.docsManipText}</li>
                    </ul>
                    <p className="text-gray-600 text-sm italic mt-6">{t.docsMetaphor}</p>
                  </section>

                  {/* Divider */}
                  <div className="h-px bg-white/5 my-16"></div>

                  {/* Technical Details Header */}
                  <p className="text-gray-600 text-xs uppercase tracking-widest mb-12">{t.docsTechDetails}</p>

                  {/* Architecture */}
                  <section id="architecture" className="mb-12">
                    <h3 className="text-white text-xl mb-6" style={{ fontFamily: 'Georgia, serif' }}>Architecture</h3>
                    <div className="grid md:grid-cols-2 gap-8">
                      <div>
                        <h4 className="text-gray-400 text-xs uppercase tracking-wider mb-3">Frontend</h4>
                        <ul className="text-gray-500 text-sm space-y-1">
                          <li>React 19 + Vite 7</li>
                          <li>Framer Motion</li>
                          <li>TailwindCSS</li>
                          <li>Zustand</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-gray-400 text-xs uppercase tracking-wider mb-3">Backend</h4>
                        <ul className="text-gray-500 text-sm space-y-1">
                          <li>FastAPI</li>
                          <li>Playwright</li>
                          <li>BeautifulSoup4</li>
                          <li>OpenAI GPT-4o</li>
                        </ul>
                      </div>
                    </div>
                  </section>

                  {/* Protocol */}
                  <section id="protocol" className="mb-12">
                    <h3 className="text-white text-xl mb-6" style={{ fontFamily: 'Georgia, serif' }}>Operational Protocol</h3>
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-gray-300 text-sm mb-1">Semantic Stripping</h4>
                        <p className="text-gray-500 text-sm">Isolate hard facts from emotional framing.</p>
                      </div>
                      <div>
                        <h4 className="text-gray-300 text-sm mb-1">Narrative Decoding</h4>
                        <p className="text-gray-500 text-sm">Identify logical fallacies and hidden axioms.</p>
                      </div>
                      <div>
                        <h4 className="text-gray-300 text-sm mb-1">Intent Inference</h4>
                        <p className="text-gray-500 text-sm">Cui Bono analysis — who benefits.</p>
                      </div>
                    </div>
                  </section>

                  {/* Scoring */}
                  <section id="scoring" className="mb-12">
                    <h3 className="text-white text-xl mb-6" style={{ fontFamily: 'Georgia, serif' }}>Scoring</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-green-500/70 w-16">0–20</span>
                        <span className="text-gray-400">Neutral — factual reporting</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-yellow-500/70 w-16">21–50</span>
                        <span className="text-gray-400">Leaning — slight editorial bias</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-orange-500/70 w-16">51–79</span>
                        <span className="text-gray-400">Propaganda — clear agenda</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-red-500/70 w-16">80–100</span>
                        <span className="text-gray-400">Weaponized — disinformation</span>
                      </div>
                    </div>
                  </section>

                  {/* Scraper */}
                  <section id="scraper" className="mb-12">
                    <h3 className="text-white text-xl mb-6" style={{ fontFamily: 'Georgia, serif' }}>Phantom Scraper</h3>
                    <p className="text-gray-500 text-sm mb-4">Web extraction engine with anti-detection:</p>
                    <ul className="text-gray-500 text-sm space-y-2">
                      <li><span className="text-gray-400">Shapeshifter</span> — rotates browser profiles</li>
                      <li><span className="text-gray-400">Stealth</span> — fingerprint spoofing</li>
                      <li><span className="text-gray-400">Bio-Mimicry</span> — human-like behavior</li>
                    </ul>
                  </section>

                  {/* GEOINT */}
                  <section id="geoint" className="mb-12">
                    <h3 className="text-white text-xl mb-6" style={{ fontFamily: 'Georgia, serif' }}>Global Overwatch</h3>
                    <p className="text-gray-500 text-sm mb-4">Real-time intelligence from 35+ geographic sectors via Google News RSS.</p>
                    <div className="flex flex-wrap gap-2">
                      {['North America', 'Europe', 'Asia Pacific', 'Middle East', 'Latin America', 'Africa', 'Scandinavia', 'Baltic'].map(region => (
                        <span key={region} className="text-gray-600 text-xs border border-white/5 px-2 py-1">{region}</span>
                      ))}
                    </div>
                  </section>

                  {/* Output */}
                  <section id="output" className="mb-16">
                    <h3 className="text-white text-xl mb-6" style={{ fontFamily: 'Georgia, serif' }}>Output Schema</h3>
                    <pre className="text-gray-500 text-xs bg-black/30 p-4 overflow-x-auto border border-white/5">
{`{
  "title": "string",
  "meta": {
    "score": 0-100,
    "verdict_short": "string",
    "tone": "string"
  },
  "intent": "string",
  "narrative_analysis": "string",
  "facts": ["string"],
  "axioms": ["string"]
}`}
                    </pre>
                  </section>

                  {/* Footer */}
                  <footer className="text-center pt-8 border-t border-white/5">
                    <p className="text-gray-600 text-xs">PRISM — Open Source Project</p>
                    <p className="text-gray-700 text-xs mt-2 italic" style={{ fontFamily: 'Georgia, serif' }}>
                      "Democracy dies in darkness. Logic survives in light."
                    </p>
                  </footer>

                </div>
              </main>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LandingPage;
