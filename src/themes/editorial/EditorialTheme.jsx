import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Search, Globe, Loader, MapPin, Home, AlertCircle } from 'lucide-react';
import useAnalysisStore from '../../store/analysisStore';
import ArticleCard from './components/ArticleCard';
import AnalysisPanel from './components/AnalysisPanel';
import MapHUD from '../../components/MapHUD';
import IntelFeed from '../../components/IntelFeed';
import MobileArticleSheet from '../../components/MobileArticleSheet';
import TrendingTicker from './components/TrendingTicker';
import API_ENDPOINTS from '../../utils/api';
import './editorial.css';

const EditorialTheme = ({ onBackToHome, analysisCount = 0, maxAnalyses = 3, onAnalysisUsed }) => {
  const {
    scrapingStatus,
    targetUrl,
    analysisData,
    setTargetUrl,
    updateStatus,
    setAnalysisData,
    // Geo State
    geoIntel,
    sectorName,
    isLoadingFeed,
    analyzingId,
    // Geo Actions
    setSelectedSector,
    setIsLoadingFeed,
    setGeoIntel,
    setSectorName
  } = useAnalysisStore();

  const [showFullAnalysis, setShowFullAnalysis] = useState(false);
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const remainingAnalyses = Math.max(0, maxAnalyses - analysisCount);
  const hasReachedLimit = remainingAnalyses <= 0;

  // Detect mobile screen
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle URL analysis
  const handleAnalyze = async (requestedUrl = targetUrl) => {
    const normalizedUrl = requestedUrl.trim();
    if (!normalizedUrl) return;

    // Check limit
    if (hasReachedLimit) {
      alert('You have reached the analysis limit. Try again after the reset time.');
      return;
    }

    updateStatus('scanning');

    try {
      const response = await fetch(API_ENDPOINTS.analyze, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: normalizedUrl }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Analysis failed');
      }

      const result = await response.json();
      setAnalysisData(result);
      setShowFullAnalysis(true);
      updateStatus('idle');

      // Increment analysis count
      if (onAnalysisUsed) {
        await onAnalysisUsed();
      }
    } catch (error) {
      console.error('Analysis error:', error);
      updateStatus('idle');
      alert(`ANALYSIS FAILED: ${error.message}`);
    }
  };

  return (
    <div className="editorial-theme min-h-screen bg-[#FDFDFD]">
      {/* Live Ticker */}
      <TrendingTicker />

      {/* Enhanced Masthead - Mobile Optimized */}
      <header className="border-b border-[#E5E5E5] bg-white">
        <div className="editorial-wide-container py-4 lg:py-8">
          {/* Mobile Header */}
          <div className="lg:hidden mb-3">
            <div className="flex items-center justify-between mb-2">
              {/* Home Button */}
              <button
                onClick={onBackToHome}
                className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-600 hover:text-[#DC2626] hover:bg-gray-100 rounded-lg transition-all"
              >
                <Home className="w-4 h-4" />
                <span>Home</span>
              </button>

              {/* Logo */}
              <div className="flex items-center gap-2">
                <Loader className="w-8 h-8 text-[#DC2626] animate-spin" />
                <h1 className="font-serif text-4xl font-black tracking-tight leading-none">
                  PRISM
                </h1>
              </div>

              {/* Analysis Counter */}
              <div className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium ${hasReachedLimit ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                <span>{remainingAnalyses}/{maxAnalyses}</span>
              </div>
            </div>
            <div className="flex items-center justify-center gap-2 text-xs font-medium text-[#DC2626] tracking-wider uppercase">
              <span className="w-1.5 h-1.5 bg-[#DC2626] rounded-full" />
              <span>Cognitive Security</span>
              <span className="w-1.5 h-1.5 bg-[#DC2626] rounded-full" />
            </div>
          </div>

          {/* Desktop Header */}
          <div className="hidden lg:flex flex-row justify-between items-center border-b-2 border-black pb-4 mb-4">
            {/* Left: Home Button + Logo */}
            <div className="flex items-center gap-4">
              <button
                onClick={onBackToHome}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-[#DC2626] hover:bg-gray-100 rounded-lg transition-all border border-gray-200"
              >
                <Home className="w-5 h-5" />
                <span>Home</span>
              </button>
              <Loader className="w-14 h-14 text-[#DC2626] animate-spin" />
              <div className="text-xs font-mono text-gray-500 uppercase tracking-widest space-y-1">
                <div>Vol. 24 • No. 118</div>
                <div>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).toUpperCase()}</div>
              </div>
            </div>

            {/* Center: Title */}
            <div className="text-center flex-1">
              <h1 className="font-serif text-7xl font-black tracking-tight leading-none mb-2">
                PRISM
              </h1>
              <div className="flex items-center justify-center gap-3 text-sm font-medium text-[#DC2626] tracking-widest uppercase">
                <span className="w-2 h-2 bg-[#DC2626] rounded-full" />
                <span>Cognitive Security Grid</span>
                <span className="w-2 h-2 bg-[#DC2626] rounded-full" />
              </div>
            </div>

            {/* Right: Analysis Counter + Status */}
            <div className="flex items-center gap-4">
              {/* Analysis Counter */}
              <div className={`flex flex-col items-center px-4 py-2 rounded-lg ${hasReachedLimit ? 'bg-red-100' : 'bg-green-50'}`}>
                <span className={`text-2xl font-bold ${hasReachedLimit ? 'text-red-600' : 'text-green-600'}`}>
                  {remainingAnalyses}
                </span>
                <span className="text-xs text-gray-500 uppercase">Analyses Left</span>
              </div>
              <div className="text-right text-xs font-mono text-gray-500 uppercase tracking-widest space-y-1">
                <div className="flex items-center justify-end gap-2">
                  <span>Runtime Mode</span>
                  <span className="text-[#DC2626] font-bold">LOCAL</span>
                </div>
                <div>API Key: <span className="text-green-600">SERVER-SIDE</span></div>
              </div>
            </div>
          </div>

          {/* Tagline - Desktop only */}
          <p className="hidden lg:block text-center font-serif italic text-gray-500 text-lg">
            "Democracy Dies in Darkness • Logic Survives in Light"
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="editorial-wide-container max-w-[95vw]">

        {/* URL Search Bar */}
        <div className="mt-6 md:mt-8 mb-8 md:mb-10 max-w-2xl mx-auto px-4 md:px-0">
          {/* Limit Warning */}
          {hasReachedLimit && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <div>
                <p className="font-medium">Analysis limit reached</p>
                <p className="text-sm text-red-600">You've used all {maxAnalyses} free analyses for this rate-limit window.</p>
              </div>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (targetUrl.trim() && !hasReachedLimit) handleAnalyze();
            }}
            className="relative"
          >
            <input
              type="url"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              placeholder={hasReachedLimit ? "Analysis limit reached" : "Paste article URL to analyze..."}
              disabled={hasReachedLimit}
              className={`w-full px-4 md:px-5 py-3 md:py-4 pr-14 text-base md:text-lg border rounded-full shadow-sm focus:outline-none transition-all ${hasReachedLimit ? 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed' : 'border-slate-200 focus:border-slate-400 focus:shadow-md bg-white'}`}
            />
            <button
              type="submit"
              disabled={!targetUrl.trim() || scrapingStatus === 'scanning' || hasReachedLimit}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-3 md:p-3 bg-[#1A1A1A] hover:bg-[#DC2626] active:bg-[#DC2626] disabled:bg-slate-300 text-white rounded-full transition-all touch-manipulation"
            >
              {scrapingStatus === 'scanning' ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : (
                <Search className="w-5 h-5" />
              )}
            </button>
          </form>
          <p className="text-center text-slate-400 text-xs md:text-sm mt-3">
            {hasReachedLimit ? `${maxAnalyses} analyses used - Session complete` : 'Paste any news URL or select an article from the map below'}
          </p>
          <p className="text-center text-slate-400 text-xs mt-2">
            Article text is sent to OpenAI for analysis. Results are AI-generated
            assessments, not verified facts. See our{" "}
            <a className="underline" href="/privacy.html">Privacy Notice</a>
            {" "}and{" "}
            <a className="underline" href="/terms.html">Terms</a>.
          </p>
        </div>

        {/* GLOBAL MONITOR */}
        <div className="mb-10">
          <h2 className="headline-secondary text-center mb-6 lg:mb-8">Global News Monitor</h2>

          {/* Mobile hint */}
          <p className="text-center text-slate-400 text-sm mb-4 lg:hidden flex items-center justify-center gap-2">
            <MapPin className="w-4 h-4" />
            Tap a country to see articles
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
            {/* Map Container - Full width on mobile */}
            <div className="lg:col-span-2 bg-slate-50 border border-slate-200 rounded-xl overflow-hidden min-h-[55vh] lg:min-h-[70vh] relative">
              {/* Scanning Overlay */}
              {scrapingStatus === 'scanning' && (
                <div className="absolute inset-0 z-40 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center">
                  <Loader className="w-12 h-12 lg:w-16 lg:h-16 text-[#DC2626] animate-spin mb-4" />
                  <h3 className="headline-tertiary text-base lg:text-xl">Analyzing Narrative...</h3>
                  <p className="text-[#666666] text-sm">Extracting bias patterns</p>
                </div>
              )}

              <MapHUD
                onSelectCountry={async (countryCode) => {
                  setSelectedSector(countryCode);
                  setIsLoadingFeed(true);
                  setGeoIntel([]);

                  // Open mobile sheet on mobile devices
                  if (isMobile) {
                    setIsMobileSheetOpen(true);
                  }

                  try {
                    const response = await fetch(API_ENDPOINTS.geoRecon(countryCode));
                    const data = await response.json();

                    if (data.status === 'TARGETS_ACQUIRED') {
                      setGeoIntel(data.data);
                      setSectorName(data.sector_name);
                    } else {
                      setGeoIntel([]);
                      setSectorName(countryCode);
                    }
                  } catch (error) {
                    console.error(error);
                    setGeoIntel([]);
                  } finally {
                    setIsLoadingFeed(false);
                  }
                }}
                isLoading={isLoadingFeed}
              />
            </div>

            {/* Desktop: Side panel for articles */}
            <div className="hidden lg:flex bg-white border border-slate-200 rounded-xl p-4 h-[70vh] overflow-hidden flex-col">
              <IntelFeed
                data={geoIntel}
                sectorName={sectorName}
                analyzingId={analyzingId}
                onAnalyze={(item) => {
                  setTargetUrl(item.url);
                  handleAnalyze(item.url);
                }}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Article Sheet */}
      <MobileArticleSheet
        isOpen={isMobileSheetOpen}
        onClose={() => setIsMobileSheetOpen(false)}
        data={geoIntel}
        sectorName={sectorName}
        isLoading={isLoadingFeed}
        analyzingId={analyzingId}
        onAnalyze={(item) => {
          setTargetUrl(item.url);
          setIsMobileSheetOpen(false);
          handleAnalyze(item.url);
        }}
      />

      {/* Full Analysis Modal */}
      <AnimatePresence>
        {showFullAnalysis && analysisData && (
          <AnalysisPanel
            data={analysisData}
            onClose={() => setShowFullAnalysis(false)}
          />
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="editorial-wide-container border-t border-[#E5E5E5] mt-20 py-8 text-center">
        <p className="caption mb-2">
          AI-assisted narrative analysis • Verify important claims independently
        </p>
        <p className="caption">
          <a className="underline" href="/privacy.html">Privacy</a>
          {" · "}
          <a className="underline" href="/terms.html">Terms</a>
        </p>
      </footer>
    </div>
  );
};

export default EditorialTheme;
