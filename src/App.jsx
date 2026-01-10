import React, { useState, useEffect } from 'react';
import { ShieldAlert, Search, Activity, Lock, AlertTriangle, CheckCircle, BarChart3, ChevronRight, Globe, Crosshair, TrendingUp, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MapHUD from './components/MapHUD';
import IntelFeed from './components/IntelFeed';
import AnimatedCounter from './components/AnimatedCounter';

// --- SUB-COMPONENTS ---

// 1. Loading Screen - Premium Design
const Scanner = () => {
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState("Initializing");

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 1;
      });
    }, 40);

    if (progress < 30) setStage("Connecting to source");
    else if (progress < 60) setStage("Extracting content");
    else if (progress < 90) setStage("Analyzing patterns");
    else setStage("Generating report");

    return () => clearInterval(interval);
  }, [progress]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] w-full px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl premium-card p-12"
      >
        <div className="space-y-10">
          {/* Logo/Icon - Premium */}
          <div className="flex justify-center">
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full blur-2xl opacity-20 animate-pulse"></div>

              {/* Rotating border */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="relative w-24 h-24 border-4 border-slate-100 border-t-primary rounded-full"
              />

              {/* Icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <FileText className="w-10 h-10 text-primary" strokeWidth={2.5} />
                </motion.div>
              </div>
            </div>
          </div>

          {/* Stage text - Premium */}
          <motion.div
            key={stage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-2"
          >
            <h3 className="text-title text-slate-900">{stage}</h3>
            <p className="text-caption text-slate-500">Please wait while we process your request</p>
          </motion.div>

          {/* Progress bar - Premium */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm font-semibold">
              <span className="text-slate-600">Progress</span>
              <span className="text-primary tabular-nums">
                <AnimatedCounter value={progress} suffix="%" />
              </span>
            </div>

            <div className="relative h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full progress-premium rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              />
            </div>
          </div>

          {/* Stats - Premium */}
          <div className="grid grid-cols-3 gap-4 pt-6">
            {[
              { icon: FileText, label: 'Sources', value: progress > 20 ? 1 : 0 },
              { icon: Activity, label: 'Analyzed', value: Math.floor(progress / 10) },
              { icon: TrendingUp, label: 'Progress', value: progress },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="text-center p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-all"
              >
                <div className="p-2 bg-white rounded-lg inline-flex mb-2 shadow-sm">
                  <stat.icon className="w-5 h-5 text-primary" strokeWidth={2.5} />
                </div>
                <div className="text-2xl font-black text-slate-900 tabular-nums">
                  <AnimatedCounter value={stat.value} suffix={stat.label === 'Progress' ? '%' : ''} />
                </div>
                <div className="text-xs text-slate-500 uppercase tracking-wider font-bold mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// 2. Results Dashboard - Premium Design
const Dashboard = ({ data, onBack }) => {
  const isHighRisk = data.meta.score > 60;
  const scoreColor = isHighRisk ? 'text-danger' : (data.meta.score > 30 ? 'text-warning' : 'text-success');
  const scoreBg = isHighRisk ? 'bg-red-50' : (data.meta.score > 30 ? 'bg-amber-50' : 'bg-emerald-50');
  const scoreRing = isHighRisk ? '#dc2626' : (data.meta.score > 30 ? '#d97706' : '#059669');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-6xl mx-auto space-y-8 pb-16"
    >
      {/* HEADER - Premium */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="premium-card p-8"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="badge-premium">
                <ShieldAlert className="w-3.5 h-3.5" />
                Analysis Report
              </span>
              <span className="text-caption text-slate-500">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            </div>
            <h1 className="text-headline text-slate-900 leading-tight max-w-2xl">
              {data.title}
            </h1>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Verdict</span>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className={`px-5 py-2.5 rounded-xl ${scoreBg} ${scoreColor} text-base font-bold border-2 ${isHighRisk ? 'border-red-200' : (data.meta.score > 30 ? 'border-amber-200' : 'border-emerald-200')} shadow-sm`}
            >
              {data.meta.verdict_short}
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* STATS GRID - Premium */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* SCORE CARD - Premium */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="md:col-span-4 premium-card p-8"
        >
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              Deception Risk
            </div>

            <div className="relative w-40 h-40">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="#f1f5f9"
                  strokeWidth="14"
                  fill="transparent"
                />
                <motion.circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke={scoreRing}
                  strokeWidth="14"
                  fill="transparent"
                  strokeDasharray={440}
                  initial={{ strokeDashoffset: 440 }}
                  animate={{ strokeDashoffset: 440 - (440 * data.meta.score) / 100 }}
                  transition={{ duration: 2, ease: [0.4, 0, 0.2, 1] }}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-5xl font-black ${scoreColor} tracking-tight`}>
                  <AnimatedCounter value={data.meta.score} duration={2000} />
                </span>
                <span className="text-slate-400 font-semibold text-sm mt-0.5">%</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-xs font-medium text-slate-500">Tone:</span>
              <span className="text-sm font-bold text-slate-900">{data.meta.tone}</span>
            </div>
          </div>
        </motion.div>

        {/* INTENT CARD - Premium */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="md:col-span-8 premium-card p-8"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className={`p-2.5 ${scoreBg} rounded-xl border ${isHighRisk ? 'border-red-200' : (data.meta.score > 30 ? 'border-amber-200' : 'border-emerald-200')}`}>
              <Activity className="w-5 h-5" style={{ color: scoreRing }} strokeWidth={2.5} />
            </div>
            <h3 className="text-title text-slate-900">Strategic Intent</h3>
          </div>
          <p className="text-body text-slate-700">
            {data.intent}
          </p>
        </motion.div>

        {/* FACTS - Premium */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="md:col-span-6 premium-card p-8"
        >
          <div className="flex items-center gap-2.5 mb-6 pb-4 border-b border-slate-100">
            <div className="p-1.5 bg-emerald-50 rounded-lg">
              <CheckCircle className="w-4 h-4 text-success" strokeWidth={2.5} />
            </div>
            <h3 className="text-title text-slate-900">Verified Facts</h3>
          </div>
          <ul className="space-y-3">
            {data.facts.map((fact, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.05 }}
                className="flex gap-3 text-sm text-slate-700 group"
              >
                <span className="text-success mt-1 flex-shrink-0 text-base">●</span>
                <span className="leading-relaxed group-hover:text-slate-900 transition-colors">{fact}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        {/* AXIOMS - Premium */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="md:col-span-6 premium-card p-8"
        >
          <div className="flex items-center gap-2.5 mb-6 pb-4 border-b border-slate-100">
            <div className="p-1.5 bg-amber-50 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-warning" strokeWidth={2.5} />
            </div>
            <h3 className="text-title text-slate-900">Hidden Axioms</h3>
          </div>
          <ul className="space-y-3">
            {data.axioms.map((ax, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.05 }}
                className="flex gap-3 text-sm text-slate-700 group"
              >
                <span className="text-warning mt-1 flex-shrink-0 text-base font-bold">▸</span>
                <span className="leading-relaxed group-hover:text-slate-900 transition-colors">{ax}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </div>

      {/* NARRATIVE ANALYSIS - Premium */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="premium-card p-8"
      >
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
          <div className="p-2.5 bg-indigo-50 rounded-xl border border-indigo-100">
            <BarChart3 className="w-5 h-5 text-primary" strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="text-title text-slate-900">Narrative Deconstruction</h3>
            <p className="text-caption text-slate-500 mt-0.5">Detailed rhetorical & framing analysis</p>
          </div>
        </div>
        <div className="prose prose-slate prose-base max-w-none">
          <p className="whitespace-pre-line text-slate-700 leading-relaxed">
            {data.narrative_analysis || "Analysis in progress..."}
          </p>
        </div>
      </motion.div>

      {/* Back Button - Premium */}
      <div className="flex justify-center pt-12">
        <motion.button
          onClick={onBack}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-white border-2 border-slate-200 rounded-xl text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-all font-semibold text-sm shadow-sm"
        >
          <span>Start New Analysis</span>
          <ChevronRight className="w-4 h-4" strokeWidth={2.5} />
        </motion.button>
      </div>
    </motion.div>
  );
};


// --- MAIN APP ---

function App() {
  const [mode, setMode] = useState('url'); // 'url' | 'geo'
  const [status, setStatus] = useState('idle'); // idle | scanning | results
  const [url, setUrl] = useState('');
  const [reportData, setReportData] = useState(null);

  // Global Overwatch State
  const [intelFeed, setIntelFeed] = useState([]);
  const [selectedSector, setSelectedSector] = useState(null);
  const [sectorName, setSectorName] = useState('');
  const [isLoadingFeed, setIsLoadingFeed] = useState(false);
  const [analyzingId, setAnalyzingId] = useState(null);

  const handleAnalyze = async (targetUrl) => {
    if (!targetUrl) return;
    setStatus('scanning');

    try {
      const response = await fetch('http://localhost:8000/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: targetUrl }),
      });

      if (!response.ok) throw new Error('Analysis Failed');

      const result = await response.json();
      setReportData(result);
      setStatus('results');
      setAnalyzingId(null);
    } catch (error) {
      console.error(error);
      setStatus('idle');
      setAnalyzingId(null);
      alert("System Error: Unable to access target vector.");
    }
  };

  const handleSelectCountry = async (countryCode) => {
    setSelectedSector(countryCode);
    setIsLoadingFeed(true);
    setIntelFeed([]);

    try {
      const response = await fetch(`http://localhost:8000/recon/geo?country_code=${countryCode}`);
      const data = await response.json();

      if (data.status === 'TARGETS_ACQUIRED') {
        setIntelFeed(data.data);
        setSectorName(data.sector_name);
      } else {
        setIntelFeed([]);
        setSectorName(countryCode);
      }
    } catch (error) {
      console.error(error);
      setIntelFeed([]);
    } finally {
      setIsLoadingFeed(false);
    }
  };

  const handleAnalyzeFromFeed = (item) => {
    setAnalyzingId(item.id);
    handleAnalyze(item.url);
  };

  const resetToIdle = () => {
    setStatus('idle');
    setUrl('');
    setReportData(null);
    setAnalyzingId(null);
  };

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Navbar - Premium */}
      <nav className="border-b border-slate-200/60 bg-white/95 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-8 py-5">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-indigo-500 rounded-2xl blur opacity-20"></div>
                <div className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-500 shadow-lg shadow-indigo-500/25">
                  <ShieldAlert className="w-5 h-5 text-white" strokeWidth={2.5} />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">Shadow Analyzer</h1>
                <p className="text-xs text-slate-500 font-medium">AI-Powered Analysis</p>
              </div>
            </div>

            {/* Mode Toggle - Premium */}
            <div className="flex items-center gap-1.5 p-1.5 bg-slate-100/80 rounded-xl border border-slate-200/60">
              <button
                onClick={() => { setMode('url'); resetToIdle(); }}
                className={`flex items-center gap-2.5 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all
                  ${mode === 'url'
                    ? 'bg-white text-slate-900 shadow-sm shadow-slate-900/5'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'}`}
              >
                <Crosshair className="w-4 h-4" strokeWidth={2} />
                <span className="hidden sm:inline">URL Analysis</span>
              </button>
              <button
                onClick={() => { setMode('geo'); resetToIdle(); }}
                className={`flex items-center gap-2.5 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all
                  ${mode === 'geo'
                    ? 'bg-white text-slate-900 shadow-sm shadow-slate-900/5'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'}`}
              >
                <Globe className="w-4 h-4" strokeWidth={2} />
                <span className="hidden sm:inline">Global Monitor</span>
              </button>
            </div>

            <div className="badge-premium">
              v3.0
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 mt-12">
        <AnimatePresence mode="wait">

          {/* URL MODE - Premium Hero */}
          {mode === 'url' && status === 'idle' && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              className="max-w-4xl mx-auto flex flex-col items-center mt-24 px-4"
              key="url-idle"
            >
              {/* Hero Section */}
              <div className="mb-16 text-center space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100"
                >
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-semibold text-indigo-700">Next-Gen Media Analysis</span>
                </motion.div>

                <h1 className="text-display text-slate-900 max-w-3xl mx-auto">
                  Decode Media Narratives with{' '}
                  <span className="relative inline-block">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600">
                      AI Precision
                    </span>
                    <svg className="absolute -bottom-2 left-0 w-full" height="8" viewBox="0 0 300 8" fill="none">
                      <path d="M1 5.5C70 2.5 140 1.5 299 5.5" stroke="url(#gradient)" strokeWidth="3" strokeLinecap="round"/>
                      <defs>
                        <linearGradient id="gradient">
                          <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.3"/>
                          <stop offset="50%" stopColor="#9333ea" stopOpacity="0.5"/>
                          <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.3"/>
                        </linearGradient>
                      </defs>
                    </svg>
                  </span>
                </h1>

                <p className="text-caption text-slate-600 max-w-2xl mx-auto text-lg">
                  Uncover hidden biases, detect rhetorical patterns, and understand the strategic intent behind any article — powered by advanced AI.
                </p>
              </div>

              {/* Search Input - Premium */}
              <div className="w-full max-w-2xl">
                <div className="premium-card p-2">
                  <div className="flex items-center gap-3">
                    <div className="pl-4">
                      <Search className="w-5 h-5 text-slate-400" strokeWidth={2} />
                    </div>
                    <input
                      type="text"
                      placeholder="Paste any article URL to begin analysis..."
                      className="flex-1 bg-transparent border-none outline-none py-4 text-slate-900 placeholder-slate-400 text-base font-medium"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAnalyze(url)}
                    />
                    <button
                      onClick={() => handleAnalyze(url)}
                      className="btn-premium text-white px-8 py-3.5 rounded-xl font-semibold text-sm flex items-center gap-2"
                    >
                      <span>Analyze</span>
                      <ChevronRight className="w-4 h-4" strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-3 text-center">
                  Press <kbd className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-xs font-mono">Enter ↵</kbd> to analyze
                </p>
              </div>

              {/* Trust Indicators */}
              <div className="mt-20 text-center space-y-4">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Trusted by professionals at</p>
                <div className="flex items-center justify-center gap-10 opacity-30 hover:opacity-50 transition-opacity">
                  {['Reuters', 'Bloomberg', 'Financial Times', 'The Economist'].map(brand => (
                    <span key={brand} className="text-sm font-bold text-slate-600 tracking-tight">{brand}</span>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* GEO MODE - Premium */}
          {mode === 'geo' && status === 'idle' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
              key="geo-idle"
            >
              {/* Map - Premium */}
              <div className="lg:col-span-2 space-y-5">
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="premium-card p-6"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-indigo-50 rounded-xl">
                      <Globe className="w-5 h-5 text-primary" strokeWidth={2.5} />
                    </div>
                    <div>
                      <h2 className="text-title text-slate-900">Global Monitor</h2>
                      <p className="text-caption text-slate-500 mt-0.5">Select a country to view recent news and analysis</p>
                    </div>
                  </div>
                </motion.div>
                <MapHUD onSelectCountry={handleSelectCountry} isLoading={isLoadingFeed} />
              </div>

              {/* Intel Feed Sidebar - Premium */}
              <div className="lg:col-span-1 premium-card p-6">
                <IntelFeed
                  data={intelFeed}
                  sectorName={sectorName}
                  onAnalyze={handleAnalyzeFromFeed}
                  analyzingId={analyzingId}
                />
              </div>
            </motion.div>
          )}

          {/* SCANNING (both modes) */}
          {status === 'scanning' && (
            <motion.div key="scanning" exit={{ opacity: 0 }} className="mt-12">
              <Scanner />
            </motion.div>
          )}

          {/* RESULTS (both modes) */}
          {status === 'results' && reportData && (
            <motion.div key="results">
              <Dashboard data={reportData} onBack={resetToIdle} />
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  );
}

export default App;
