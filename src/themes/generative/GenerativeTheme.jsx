import React from 'react';
import { motion } from 'framer-motion';
import { Zap, RefreshCw } from 'lucide-react';
import useAnalysisStore from '../../store/analysisStore';
import ParticleField from './components/ParticleField';
import { scoreToHue } from '../../utils/formatAnalysis';
import './generative.css';

const GenerativeTheme = () => {
  const {
    scrapingStatus,
    targetUrl,
    analysisData,
    setTargetUrl,
    updateStatus,
    setAnalysisData,
    resetAnalysis
  } = useAnalysisStore();

  const handleAnalyze = async () => {
    if (!targetUrl.trim()) return;

    updateStatus('scanning');

    try {
      const response = await fetch('http://localhost:8000/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: targetUrl }),
      });

      if (!response.ok) throw new Error('Analysis failed');

      const result = await response.json();
      setAnalysisData(result);
    } catch (error) {
      console.error('Analysis error:', error);
      updateStatus('idle');
      alert('Analysis failed');
    }
  };

  const score = analysisData?.meta?.score || 0;
  const hue = scoreToHue(score);

  return (
    <div className="generative-theme">
      {/* Particle Background */}
      <ParticleField score={score} />

      {/* Content Layer */}
      <div className="gen-content">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="gen-title">SHADOW ANALYZER</h1>
          <p className="gen-subtitle">Generative Media Analysis</p>
        </motion.header>

        {/* Main Content */}
        <main>
          {/* Idle State */}
          {scrapingStatus === 'idle' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="gen-panel max-w-3xl mx-auto"
            >
              <div className="text-center mb-8">
                <Zap className="w-16 h-16 mx-auto mb-4" style={{ color: '#4ECDC4' }} />
                <h2 className="gen-heading">Enter the Data Stream</h2>
                <p className="gen-body">
                  Paste an article URL to generate a visual analysis
                </p>
              </div>

              <div className="flex gap-3">
                <input
                  type="url"
                  placeholder="https://example.com/article"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAnalyze()}
                  className="gen-input flex-1"
                />
                <button
                  onClick={handleAnalyze}
                  className="gen-button"
                >
                  Generate
                </button>
              </div>
            </motion.div>
          )}

          {/* Scanning State */}
          {scrapingStatus === 'scanning' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="gen-panel max-w-3xl mx-auto"
            >
              <div className="gen-loading">
                <h3 className="gen-heading mb-8">Generating Analysis...</h3>
                <div className="gen-loading-dots">
                  <div className="gen-loading-dot" style={{ color: '#FF6B6B' }}></div>
                  <div className="gen-loading-dot" style={{ color: '#4ECDC4' }}></div>
                  <div className="gen-loading-dot" style={{ color: '#45B7D1' }}></div>
                </div>
                <p className="gen-body mt-8" style={{ opacity: 0.6 }}>
                  Processing data streams and generating visualizations
                </p>
              </div>
            </motion.div>
          )}

          {/* Results State */}
          {scrapingStatus === 'results' && analysisData && (
            <div className="space-y-8">
              {/* Score Visualization */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="gen-panel text-center"
              >
                <div className="gen-score" style={{ color: `hsl(${hue}, 80%, 60%)` }}>
                  <div className="gen-score-ring"></div>
                  <div className="gen-score-value">
                    <div>{score}</div>
                    <div className="gen-score-label">Bias Index</div>
                  </div>
                </div>
                <h2 className="gen-heading mt-4">{analysisData.title}</h2>
                <div className="flex justify-center gap-4 mt-4 text-sm" style={{ opacity: 0.7 }}>
                  <span>Tone: {analysisData.meta?.tone}</span>
                  <span>•</span>
                  <span>{analysisData.meta?.verdict_short}</span>
                </div>
              </motion.div>

              {/* Intent */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="gen-panel"
              >
                <h3 className="gen-heading mb-4">Strategic Intent</h3>
                <p className="gen-body">{analysisData.intent}</p>
              </motion.div>

              {/* Data Clusters */}
              <div className="grid md:grid-cols-2 gap-8">
                {/* Facts */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="gen-panel"
                >
                  <h3 className="gen-heading mb-4" style={{ color: '#4ECDC4' }}>
                    Verified Data Points
                  </h3>
                  <ul className="gen-list" style={{ color: '#4ECDC4' }}>
                    {analysisData.facts?.map((fact, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 + i * 0.1 }}
                      >
                        {fact}
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>

                {/* Axioms */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="gen-panel"
                >
                  <h3 className="gen-heading mb-4" style={{ color: '#FF6B6B' }}>
                    Hidden Patterns
                  </h3>
                  <ul className="gen-list" style={{ color: '#FF6B6B' }}>
                    {analysisData.axioms?.map((axiom, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 + i * 0.1 }}
                      >
                        {axiom}
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              </div>

              {/* Narrative Stream */}
              {analysisData.narrative_analysis && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="gen-panel"
                >
                  <h3 className="gen-heading mb-4">Narrative Stream</h3>
                  <p className="gen-body whitespace-pre-line" style={{ opacity: 0.85 }}>
                    {analysisData.narrative_analysis}
                  </p>
                </motion.div>
              )}

              {/* Reset */}
              <div className="text-center pt-8">
                <button
                  onClick={resetAnalysis}
                  className="gen-button inline-flex items-center gap-2"
                >
                  <RefreshCw className="w-5 h-5" />
                  <span>New Generation</span>
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default GenerativeTheme;
