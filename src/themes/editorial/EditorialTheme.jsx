import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Globe, Loader, MapPin } from 'lucide-react';
import useAnalysisStore from '../../store/analysisStore';
import ArticleCard from './components/ArticleCard';
import AnalysisPanel from './components/AnalysisPanel';
import MapHUD from '../../components/MapHUD';
import IntelFeed from '../../components/IntelFeed';
import MobileArticleSheet from '../../components/MobileArticleSheet';
import TrendingTicker from './components/TrendingTicker';
import API_ENDPOINTS from '../../utils/api';
import './editorial.css';

const EditorialTheme = () => {
  const {
    scrapingStatus,
    targetUrl,
    analysisData,
    setTargetUrl,
    updateStatus,
    setAnalysisData,
    resetAnalysis,
    // Geo State
    geoIntel,
    selectedSector,
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

  // Detect mobile screen
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle URL analysis
  const handleAnalyze = async () => {
    if (!targetUrl.trim()) return;

    updateStatus('scanning');

    try {
      const response = await fetch(API_ENDPOINTS.analyze, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: targetUrl }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Analysis failed');
      }

      const result = await response.json();
      setAnalysisData(result);
      setShowFullAnalysis(true);
      updateStatus('idle');
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
          <div className="lg:hidden text-center mb-3">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Loader className="w-8 h-8 text-[#DC2626] animate-spin" />
              <h1 className="font-serif text-4xl font-black tracking-tight leading-none">
                PRISM
              </h1>
            </div>
            <div className="flex items-center justify-center gap-2 text-xs font-medium text-[#DC2626] tracking-wider uppercase">
              <span className="w-1.5 h-1.5 bg-[#DC2626] rounded-full" />
              <span>Cognitive Security</span>
              <span className="w-1.5 h-1.5 bg-[#DC2626] rounded-full" />
            </div>
          </div>

          {/* Desktop Header */}
          <div className="hidden lg:flex flex-row justify-between items-center border-b-2 border-black pb-4 mb-4">
            {/* Left: Logo + Meta Data */}
            <div className="flex items-center gap-4">
              <Loader className="w-14 h-14 text-[#DC2626] animate-spin" />
              <div className="text-xs font-mono text-gray-500 uppercase tracking-widest space-y-1">
                <div>Vol. 24 • No. 118</div>
                <div>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).toUpperCase()}</div>
                <div>Lat: 41.90N • Lon: 12.49E</div>
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

            {/* Right: System Status */}
            <div className="text-right text-xs font-mono text-gray-500 uppercase tracking-widest space-y-1">
              <div className="flex items-center justify-end gap-2">
                <span>Global Bias Index</span>
                <span className="text-[#DC2626] font-bold">CRITICAL</span>
              </div>
              <div>System Status: <span className="text-green-600">ONLINE</span></div>
              <div>Ops Cycle: 24/7</div>
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
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (targetUrl.trim()) handleAnalyze();
            }}
            className="relative"
          >
            <input
              type="url"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              placeholder="Paste article URL to analyze..."
              className="w-full px-4 md:px-5 py-3 md:py-4 pr-14 text-base md:text-lg border border-slate-200 rounded-full shadow-sm focus:outline-none focus:border-slate-400 focus:shadow-md transition-all bg-white"
            />
            <button
              type="submit"
              disabled={!targetUrl.trim() || scrapingStatus === 'scanning'}
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
            Paste any news URL or select an article from the map below
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
                  handleAnalyze();
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
          handleAnalyze();
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
        <p className="caption">
          Powered by advanced AI analysis • Built with integrity and transparency
        </p>
      </footer>
    </div>
  );
};

export default EditorialTheme;
