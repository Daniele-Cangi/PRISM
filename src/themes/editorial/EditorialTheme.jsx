import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Globe, Loader } from 'lucide-react';
import useAnalysisStore from '../../store/analysisStore';
import ArticleCard from './components/ArticleCard';
import AnalysisPanel from './components/AnalysisPanel';
import MapHUD from '../../components/MapHUD';
import IntelFeed from '../../components/IntelFeed';
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

      {/* Enhanced Masthead */}
      <header className="border-b border-[#E5E5E5] bg-white">
        <div className="editorial-wide-container py-8">
          <div className="flex flex-col md:flex-row justify-between items-center border-b-2 border-black pb-4 mb-4">
            {/* Left: Logo + Meta Data */}
            <div className="hidden md:flex items-center gap-4">
              <Loader className="w-14 h-14 text-[#DC2626] animate-spin" />
              <div className="text-xs font-mono text-gray-500 uppercase tracking-widest space-y-1">
                <div>Vol. 24 • No. 118</div>
                <div>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).toUpperCase()}</div>
                <div>Lat: 41.90N • Lon: 12.49E</div>
              </div>
            </div>

            {/* Center: Title */}
            <div className="text-center flex-1">
              <h1 className="font-serif text-5xl md:text-7xl font-black tracking-tight leading-none mb-2">
                SHADOW ANALYZER
              </h1>
              <div className="flex items-center justify-center gap-3 text-sm font-medium text-[#DC2626] tracking-widest uppercase">
                <span className="w-2 h-2 bg-[#DC2626] rounded-full" />
                <span>Cognitive Security Grid</span>
                <span className="w-2 h-2 bg-[#DC2626] rounded-full" />
              </div>
            </div>

            {/* Right: System Status */}
            <div className="hidden md:block text-right text-xs font-mono text-gray-500 uppercase tracking-widest space-y-1">
              <div className="flex items-center justify-end gap-2">
                <span>Global Bias Index</span>
                <span className="text-[#DC2626] font-bold">CRITICAL</span>
              </div>
              <div>System Status: <span className="text-green-600">ONLINE</span></div>
              <div>Ops Cycle: 24/7</div>
            </div>
          </div>

          {/* Tagline */}
          <p className="text-center font-serif italic text-gray-500 text-lg">
            "Democracy Dies in Darkness • logic Survives in Light"
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="editorial-wide-container max-w-[95vw]">

        {/* GLOBAL MONITOR */}
        <div className="mt-6 mb-10">
          <h2 className="headline-secondary text-center mb-8">Global News Monitor</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-slate-50 border border-slate-200 rounded-xl overflow-hidden min-h-[70vh] relative">
              {/* Scanning Overlay */}
              {scrapingStatus === 'scanning' && (
                <div className="absolute inset-0 z-50 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center">
                  <Loader className="w-16 h-16 text-[#DC2626] animate-spin mb-4" />
                  <h3 className="headline-tertiary">Analyzing Narrative...</h3>
                  <p className="text-[#666666]">Extracting bias patterns and hidden axioms</p>
                </div>
              )}

              <MapHUD
                onSelectCountry={async (countryCode) => {
                  setSelectedSector(countryCode);
                  setIsLoadingFeed(true);
                  setGeoIntel([]);

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
            <div className="bg-white border border-slate-200 rounded-xl p-4 h-[70vh] overflow-hidden flex flex-col">
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
