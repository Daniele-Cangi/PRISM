import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader, ChevronDown } from 'lucide-react';

const LandingPage = ({ onLogin }) => {
  const [language, setLanguage] = useState('en');
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

  // Traduzioni
  const translations = {
    en: {
      code: 'EN',
      flag: '🇬🇧',
      name: 'English',
      // Hero
      cognitiveGrid: 'Cognitive Security Grid',
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
      missionText2: 'Shadow Analyzer was created to give citizens the power to see beyond the narrative. We are building a team of experts in journalism, artificial intelligence and cybersecurity united by a common vision.',
      theFounders: 'The Founders',
      // Sponsorship
      supportTitle: 'Support the Project',
      supportText: 'Shadow Analyzer is an open source project. Your support helps us continue development and maintenance of this tool for information democracy.',
      sponsorGithub: 'Sponsor directly on GitHub',
      sponsor: 'Sponsor',
      becomePatron: 'Become a monthly patron',
      patron: 'Become Patron',
      buyCoffee: 'Buy us a coffee',
      coffee: 'Buy a Coffee',
      kofiSupport: 'One-time or monthly support',
      kofiBtn: 'Support on Ko-fi',
      supportThanks: 'Every contribution, big or small, helps us keep Shadow Analyzer free and open source.',
      thanksHeart: '❤️ Thank you for your support!',
      // Legal Transparency
      legalTitle: 'Transparency & Compliance',
      legalText: 'Shadow Analyzer is committed to full transparency. Our entire project database will undergo independent legal review every 15 days to ensure compliance with all applicable laws and regulations. (Coming Soon)',
      legalMonitored: 'Monitored by',
      legalVerified: 'Legal compliance planned',
      legalBtn: 'View Compliance Status',
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
      joinModalText: 'We are looking for passionate experts in journalism, AI, and cybersecurity. Fill out the form to apply.',
      joinName: 'Full Name',
      joinEmail: 'Email',
      joinRole: 'Area of Expertise',
      joinRoleJournalism: 'Journalism',
      joinRoleAI: 'Artificial Intelligence',
      joinRoleCyber: 'Cybersecurity',
      joinRoleOther: 'Other',
      joinMessage: 'Why do you want to join?',
      joinSubmit: 'Send Application',
      joinClose: 'Close'
    },
    da: {
      code: 'DK',
      flag: '🇩🇰',
      name: 'Dansk',
      cognitiveGrid: 'Kognitivt Sikkerhedsnet',
      loginTitle: 'Log ind for at fortsætte',
      continueGoogle: 'Fortsæt med Google',
      continueMicrosoft: 'Fortsæt med Microsoft',
      or: 'eller',
      guestAccess: 'Fortsæt som gæst',
      termsText: 'Ved at logge ind accepterer du vores servicevilkår og privatlivspolitik',
      scrollMore: 'Opdag mere',
      missionTitle: 'Vores Mission',
      missionText1: 'I en tid med informationsoverbelastning er det blevet afgørende for demokratiet at skelne sandhed fra manipulation.',
      missionText2: 'Shadow Analyzer blev skabt for at give borgerne magten til at se ud over narrativet. Vi er ved at opbygge et team af eksperter inden for journalistik, kunstig intelligens og cybersikkerhed forenet af en fælles vision.',
      theFounders: 'Grundlæggerne',
      supportTitle: 'Støt Projektet',
      supportText: 'Shadow Analyzer er et open source-projekt. Din støtte hjælper os med at fortsætte udviklingen og vedligeholdelsen af dette værktøj for informationsdemokrati.',
      sponsorGithub: 'Sponsor direkte på GitHub',
      sponsor: 'Sponsor',
      becomePatron: 'Bliv månedlig patron',
      patron: 'Bliv Patron',
      buyCoffee: 'Køb os en kaffe',
      coffee: 'Køb en Kaffe',
      kofiSupport: 'Engangsstøtte eller månedlig',
      kofiBtn: 'Støt på Ko-fi',
      supportThanks: 'Hvert bidrag, stort som lille, hjælper os med at holde Shadow Analyzer gratis og open source.',
      thanksHeart: '❤️ Tak for din støtte!',
      legalTitle: 'Gennemsigtighed & Overholdelse',
      legalText: 'Shadow Analyzer er forpligtet til fuld gennemsigtighed. Hele vores projektdatabase vil gennemgå en uafhængig juridisk gennemgang hver 15. dag for at sikre overholdelse af alle gældende love og regler. (Kommer snart)',
      legalMonitored: 'Overvåget af',
      legalVerified: 'Juridisk overholdelse planlagt',
      legalBtn: 'Se Overholdelsesstatus',
      contactTitle: 'Følg og Kontakt Os',
      contactText: 'Hold dig opdateret om vores projekter og AI-innovationer',
      codeAndCoffee: 'Kode & kaffe',
      letsTalk: 'Lad os tale',
      houston: 'Houston, vi har et problem',
      aiLab: 'Laboratorium for Kunstig Intelligens',
      joinTeam: 'Bliv en del af teamet',
      joinSlogan: 'Vær med til forandringen',
      joinModalTitle: 'Deltag i vores mission',
      joinModalText: 'Vi søger passionerede eksperter inden for journalistik, AI og cybersikkerhed. Udfyld formularen for at ansøge.',
      joinName: 'Fulde navn',
      joinEmail: 'E-mail',
      joinRole: 'Ekspertiseområde',
      joinRoleJournalism: 'Journalistik',
      joinRoleAI: 'Kunstig intelligens',
      joinRoleCyber: 'Cybersikkerhed',
      joinRoleOther: 'Andet',
      joinMessage: 'Hvorfor vil du være med?',
      joinSubmit: 'Send ansøgning',
      joinClose: 'Luk'
    },
    sv: {
      code: 'SE',
      flag: '🇸🇪',
      name: 'Svenska',
      cognitiveGrid: 'Kognitivt Säkerhetsnät',
      loginTitle: 'Logga in för att fortsätta',
      continueGoogle: 'Fortsätt med Google',
      continueMicrosoft: 'Fortsätt med Microsoft',
      or: 'eller',
      guestAccess: 'Fortsätt som gäst',
      termsText: 'Genom att logga in accepterar du våra användarvillkor och sekretesspolicy',
      scrollMore: 'Upptäck mer',
      missionTitle: 'Vårt Uppdrag',
      missionText1: 'I en tid av informationsöverflöd har det blivit avgörande för demokratin att skilja sanning från manipulation.',
      missionText2: 'Shadow Analyzer skapades för att ge medborgarna makten att se bortom narrativet. Vi bygger ett team av experter inom journalistik, artificiell intelligens och cybersäkerhet förenade av en gemensam vision.',
      theFounders: 'Grundarna',
      supportTitle: 'Stöd Projektet',
      supportText: 'Shadow Analyzer är ett open source-projekt. Ditt stöd hjälper oss att fortsätta utvecklingen och underhållet av detta verktyg för informationsdemokrati.',
      sponsorGithub: 'Sponsra direkt på GitHub',
      sponsor: 'Sponsra',
      becomePatron: 'Bli månadspatron',
      patron: 'Bli Patron',
      buyCoffee: 'Bjud oss på en kaffe',
      coffee: 'Köp en Kaffe',
      kofiSupport: 'Engångsstöd eller månatligt',
      kofiBtn: 'Stöd på Ko-fi',
      supportThanks: 'Varje bidrag, stort som litet, hjälper oss att hålla Shadow Analyzer gratis och open source.',
      thanksHeart: '❤️ Tack för ditt stöd!',
      legalTitle: 'Transparens & Efterlevnad',
      legalText: 'Shadow Analyzer är engagerat i full transparens. Hela vår projektdatabas kommer att genomgå oberoende juridisk granskning var 15:e dag för att säkerställa efterlevnad av alla tillämpliga lagar och förordningar. (Kommer snart)',
      legalMonitored: 'Övervakat av',
      legalVerified: 'Juridisk efterlevnad planerad',
      legalBtn: 'Visa Efterlevnadsstatus',
      contactTitle: 'Följ och Kontakta Oss',
      contactText: 'Håll dig uppdaterad om våra projekt och AI-innovationer',
      codeAndCoffee: 'Kod & kaffe',
      letsTalk: 'Låt oss prata',
      houston: 'Houston, vi har ett problem',
      aiLab: 'Laboratorium för Artificiell Intelligens',
      joinTeam: 'Gå med i teamet',
      joinSlogan: 'Var en del av förändringen',
      joinModalTitle: 'Delta i vårt uppdrag',
      joinModalText: 'Vi söker passionerade experter inom journalistik, AI och cybersäkerhet. Fyll i formuläret för att ansöka.',
      joinName: 'Fullständigt namn',
      joinEmail: 'E-post',
      joinRole: 'Expertisområde',
      joinRoleJournalism: 'Journalistik',
      joinRoleAI: 'Artificiell intelligens',
      joinRoleCyber: 'Cybersäkerhet',
      joinRoleOther: 'Annat',
      joinMessage: 'Varför vill du vara med?',
      joinSubmit: 'Skicka ansökan',
      joinClose: 'Stäng'
    },
    no: {
      code: 'NO',
      flag: '🇳🇴',
      name: 'Norsk',
      cognitiveGrid: 'Kognitivt Sikkerhetsnett',
      loginTitle: 'Logg inn for å fortsette',
      continueGoogle: 'Fortsett med Google',
      continueMicrosoft: 'Fortsett med Microsoft',
      or: 'eller',
      guestAccess: 'Fortsett som gjest',
      termsText: 'Ved å logge inn aksepterer du våre tjenestevilkår og personvernregler',
      scrollMore: 'Oppdag mer',
      missionTitle: 'Vårt Oppdrag',
      missionText1: 'I en tid med informasjonsoverbelastning har det blitt avgjørende for demokratiet å skille sannhet fra manipulasjon.',
      missionText2: 'Shadow Analyzer ble skapt for å gi borgerne makten til å se forbi narrativet. Vi bygger et team av eksperter innen journalistikk, kunstig intelligens og cybersikkerhet forent av en felles visjon.',
      theFounders: 'Grunnleggerne',
      supportTitle: 'Støtt Prosjektet',
      supportText: 'Shadow Analyzer er et open source-prosjekt. Din støtte hjelper oss å fortsette utviklingen og vedlikeholdet av dette verktøyet for informasjonsdemokrati.',
      sponsorGithub: 'Sponsor direkte på GitHub',
      sponsor: 'Sponsor',
      becomePatron: 'Bli månedlig patron',
      patron: 'Bli Patron',
      buyCoffee: 'Kjøp oss en kaffe',
      coffee: 'Kjøp en Kaffe',
      kofiSupport: 'Engangsstøtte eller månedlig',
      kofiBtn: 'Støtt på Ko-fi',
      supportThanks: 'Hvert bidrag, stort som lite, hjelper oss å holde Shadow Analyzer gratis og open source.',
      thanksHeart: '❤️ Takk for din støtte!',
      legalTitle: 'Åpenhet & Etterlevelse',
      legalText: 'Shadow Analyzer er forpliktet til full åpenhet. Hele prosjektdatabasen vår vil gjennomgå uavhengig juridisk gjennomgang hver 15. dag for å sikre etterlevelse av alle gjeldende lover og forskrifter. (Kommer snart)',
      legalMonitored: 'Overvåket av',
      legalVerified: 'Juridisk etterlevelse planlagt',
      legalBtn: 'Se Etterlevelsestatus',
      contactTitle: 'Følg og Kontakt Oss',
      contactText: 'Hold deg oppdatert om våre prosjekter og AI-innovasjoner',
      codeAndCoffee: 'Kode & kaffe',
      letsTalk: 'La oss snakke',
      houston: 'Houston, vi har et problem',
      aiLab: 'Laboratorium for Kunstig Intelligens',
      joinTeam: 'Bli med i teamet',
      joinSlogan: 'Vær en del av endringen',
      joinModalTitle: 'Delta i vårt oppdrag',
      joinModalText: 'Vi søker lidenskapelige eksperter innen journalistikk, AI og cybersikkerhet. Fyll ut skjemaet for å søke.',
      joinName: 'Fullt navn',
      joinEmail: 'E-post',
      joinRole: 'Ekspertiseområde',
      joinRoleJournalism: 'Journalistikk',
      joinRoleAI: 'Kunstig intelligens',
      joinRoleCyber: 'Cybersikkerhet',
      joinRoleOther: 'Annet',
      joinMessage: 'Hvorfor vil du bli med?',
      joinSubmit: 'Send søknad',
      joinClose: 'Lukk'
    },
    it: {
      code: 'IT',
      flag: '🇮🇹',
      name: 'Italiano',
      cognitiveGrid: 'Griglia di Sicurezza Cognitiva',
      loginTitle: 'Accedi per continuare',
      continueGoogle: 'Continua con Google',
      continueMicrosoft: 'Continua con Microsoft',
      or: 'oppure',
      guestAccess: 'Entra come Ospite',
      termsText: 'Accedendo accetti i nostri Termini di Servizio e la Privacy Policy',
      scrollMore: 'Scopri di più',
      missionTitle: 'La Nostra Missione',
      missionText1: "In un'era di sovraccarico informativo, distinguere la verità dalla manipolazione è diventato essenziale per la democrazia.",
      missionText2: 'Shadow Analyzer è stato creato per dare ai cittadini il potere di vedere oltre la narrativa. Stiamo costruendo un team di esperti in giornalismo, intelligenza artificiale e cybersecurity uniti da una visione comune.',
      theFounders: 'I Fondatori',
      supportTitle: 'Supporta il Progetto',
      supportText: 'Shadow Analyzer è un progetto open source. Il tuo supporto ci aiuta a continuare lo sviluppo e la manutenzione di questo strumento per la democrazia informativa.',
      sponsorGithub: 'Sponsorizza direttamente su GitHub',
      sponsor: 'Sponsorizza',
      becomePatron: 'Diventa un patron mensile',
      patron: 'Diventa Patron',
      buyCoffee: 'Offrici un caffè',
      coffee: 'Offri un Caffè',
      kofiSupport: 'Supporto una tantum o mensile',
      kofiBtn: 'Supporta su Ko-fi',
      supportThanks: 'Ogni contributo, grande o piccolo, ci aiuta a mantenere Shadow Analyzer gratuito e open source.',
      thanksHeart: '❤️ Grazie per il tuo supporto!',
      legalTitle: 'Trasparenza & Conformità',
      legalText: "Shadow Analyzer si impegna per la massima trasparenza. L'intero database del progetto sarà sottoposto a revisione legale indipendente ogni 15 giorni per garantire la conformità a tutte le leggi e normative applicabili. (Prossimamente)",
      legalMonitored: 'Monitorato da',
      legalVerified: 'Conformità legale pianificata',
      legalBtn: 'Visualizza Stato Conformità',
      contactTitle: 'Seguici e Contattaci',
      contactText: 'Resta aggiornato sui nostri progetti e innovazioni AI',
      codeAndCoffee: 'Codice & caffè',
      letsTalk: 'Parliamone',
      houston: 'Houston, abbiamo un problema',
      aiLab: 'Laboratorio di Intelligenza Artificiale',
      joinTeam: 'Unisciti al Team',
      joinSlogan: 'Fai parte del cambiamento',
      joinModalTitle: 'Unisciti alla Nostra Missione',
      joinModalText: 'Cerchiamo esperti appassionati in giornalismo, AI e cybersecurity. Compila il form per candidarti.',
      joinName: 'Nome completo',
      joinEmail: 'Email',
      joinRole: 'Area di competenza',
      joinRoleJournalism: 'Giornalismo',
      joinRoleAI: 'Intelligenza Artificiale',
      joinRoleCyber: 'Cybersecurity',
      joinRoleOther: 'Altro',
      joinMessage: 'Perché vuoi unirti a noi?',
      joinSubmit: 'Invia Candidatura',
      joinClose: 'Chiudi'
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

        {/* MENU LINGUE - Fisso in alto a destra, minimalista */}
        <div className="fixed top-4 right-4 z-50">
          <div className="relative">
            {/* Toggle Button - Solo bandiera */}
            <button
              onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
              className="flex items-center gap-1 bg-black/50 hover:bg-black/70 backdrop-blur-sm text-white px-3 py-2 rounded-lg transition-all duration-200"
            >
              <span className="text-lg">{translations[language].flag}</span>
              <ChevronDown className={`w-3 h-3 opacity-60 transition-transform ${isLangMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu - Minimalista */}
            <AnimatePresence>
              {isLangMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full right-0 mt-1 bg-black/80 backdrop-blur-md border border-white/10 rounded-lg overflow-hidden shadow-lg"
                >
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code);
                        setIsLangMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-left transition-all duration-150 ${
                        language === lang.code
                          ? 'bg-white/10 text-white'
                          : 'text-gray-400 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <span className="text-base">{lang.flag}</span>
                      <span className="text-sm">{lang.code}</span>
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
              SHADOW ANALYZER
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
              {/* Foto 1 - Grande in alto a sinistra */}
              <motion.div
                className="absolute top-0 left-0 w-64 h-64 rounded-2xl overflow-hidden border-4 border-white/10 shadow-2xl z-10"
                whileHover={{ scale: 1.05, zIndex: 30 }}
                transition={{ duration: 0.3 }}
              >
                <img
                  src="/1516274888460.jpeg"
                  alt="Founder 1"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              </motion.div>

              {/* Foto 2 - Media in basso a destra */}
              <motion.div
                className="absolute bottom-0 right-0 w-56 h-56 rounded-2xl overflow-hidden border-4 border-[#DC2626]/30 shadow-2xl z-20"
                whileHover={{ scale: 1.05, zIndex: 30 }}
                transition={{ duration: 0.3 }}
              >
                <img
                  src="/1684496683015.jpeg"
                  alt="Founder 2"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              </motion.div>

              {/* Foto 3 - Piccola al centro */}
              <motion.div
                className="absolute top-1/2 right-1/4 transform -translate-y-1/2 w-48 h-48 rounded-full overflow-hidden border-4 border-white/20 shadow-2xl z-30"
                whileHover={{ scale: 1.1, zIndex: 40 }}
                transition={{ duration: 0.3 }}
              >
                <img
                  src="/1758023934673.jpeg"
                  alt="Founder 3"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
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
              <motion.a
                href="https://github.com/sponsors/unityloop"
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="bg-gradient-to-br from-[#1a1a2e] to-[#0d0d1a] border border-white/10 rounded-2xl p-6 hover:border-[#DC2626]/50 hover:scale-105 transition-all duration-300 group text-center"
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
              </motion.a>

              {/* Patreon */}
              <motion.a
                href="https://patreon.com/unityloop"
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-gradient-to-br from-[#1a1a2e] to-[#0d0d1a] border border-white/10 rounded-2xl p-6 hover:border-[#f96854]/50 hover:scale-105 transition-all duration-300 group text-center"
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
              </motion.a>

              {/* Buy Me a Coffee */}
              <motion.a
                href="https://buymeacoffee.com/unityloop"
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-gradient-to-br from-[#1a1a2e] to-[#0d0d1a] border border-white/10 rounded-2xl p-6 hover:border-[#FFDD00]/50 hover:scale-105 transition-all duration-300 group text-center"
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
              </motion.a>

              {/* Ko-fi */}
              <motion.a
                href="https://ko-fi.com/unityloop"
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-gradient-to-br from-[#1a1a2e] to-[#0d0d1a] border border-white/10 rounded-2xl p-6 hover:border-[#FF5E5B]/50 hover:scale-105 transition-all duration-300 group text-center"
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
              </motion.a>
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

                {/* Right - Card with link */}
                <div className="flex flex-col items-center">
                  <div className="bg-black/40 border border-white/10 rounded-2xl p-6 text-center w-full max-w-sm">
                    <p className="text-gray-400 text-sm mb-3">{t.legalMonitored}</p>

                    {/* LLegal Logo */}
                    <div className="mb-4">
                      <img
                        src="/llegal-logo.svg"
                        alt="LLegal"
                        className="h-16 mx-auto"
                      />
                    </div>

                    <p className="text-white font-semibold mb-4">llegal.unityloop.ai</p>

                    <a
                      href="http://llegal.unityloop.ai/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-[#DC2626] hover:bg-[#b91c1c] text-white font-medium px-6 py-3 rounded-xl transition-all duration-300 hover:scale-105"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      {t.legalBtn}
                    </a>
                  </div>

                  {/* 15 days badge */}
                  <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Audit cycle: 15 days</span>
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
              {/* Unity Loop Logo */}
              <div className="mb-6">
                <Loader className="w-10 h-10 text-[#DC2626] animate-spin mx-auto mb-3" />
                <a
                  href="https://unityloop.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-2xl font-bold text-white hover:text-[#DC2626] transition-colors"
                  style={{ fontFamily: 'Playfair Display, serif' }}
                >
                  unityloop.ai
                </a>
                <p className="text-gray-500 text-sm mt-1">{t.aiLab}</p>
              </div>

              {/* Copyright */}
              <div className="text-center">
                <p className="text-gray-600 text-sm">
                  unityloop.ai - 2025 DK
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
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#DC2626]/20 flex items-center justify-center">
                  <svg className="w-8 h-8 text-[#DC2626]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                  {t.joinModalTitle}
                </h3>
                <p className="text-gray-400 text-sm">
                  {t.joinModalText}
                </p>
              </div>

              {/* Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target);
                  const data = Object.fromEntries(formData);
                  window.open(`mailto:contact@unityloop.ai?subject=Join Team Application&body=Name: ${data.name}%0AEmail: ${data.email}%0ARole: ${data.role}%0AMessage: ${data.message}`, '_blank');
                  setIsJoinModalOpen(false);
                }}
                className="space-y-4"
              >
                {/* Name */}
                <div>
                  <label className="block text-gray-400 text-sm mb-1">{t.joinName}</label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-[#DC2626] focus:outline-none transition-colors"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-gray-400 text-sm mb-1">{t.joinEmail}</label>
                  <input
                    type="email"
                    name="email"
                    required
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-[#DC2626] focus:outline-none transition-colors"
                  />
                </div>

                {/* Role */}
                <div>
                  <label className="block text-gray-400 text-sm mb-1">{t.joinRole}</label>
                  <select
                    name="role"
                    required
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#DC2626] focus:outline-none transition-colors"
                  >
                    <option value="">{t.joinRole}</option>
                    <option value="journalism">{t.joinRoleJournalism}</option>
                    <option value="ai">{t.joinRoleAI}</option>
                    <option value="cybersecurity">{t.joinRoleCyber}</option>
                    <option value="other">{t.joinRoleOther}</option>
                  </select>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-gray-400 text-sm mb-1">{t.joinMessage}</label>
                  <textarea
                    name="message"
                    rows={3}
                    required
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-[#DC2626] focus:outline-none transition-colors resize-none"
                  ></textarea>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="w-full bg-[#DC2626] hover:bg-[#b91c1c] text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 hover:scale-[1.02]"
                >
                  {t.joinSubmit}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LandingPage;
