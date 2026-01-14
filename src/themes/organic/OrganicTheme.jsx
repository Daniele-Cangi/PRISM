import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, RefreshCw } from 'lucide-react';
import useAnalysisStore from '../../store/analysisStore';
import BlobBackground from './components/BlobBackground';
import FloatingCard from './components/FloatingCard';
import { getScoreBand } from '../../utils/formatAnalysis';
import API_ENDPOINTS from '../../utils/api';
import './organic.css';

const OrganicTheme = () => {
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
      const response = await fetch(API_ENDPOINTS.analyze, {
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
      alert('Analysis failed. Please try again.');
    }
  };

  const getScoreColor = (score) => {
    if (score < 30) return 'linear-gradient(135deg, #10B981 0%, #059669 100%)';
    if (score < 70) return 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)';
    return 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)';
  };

  return (
    <div className="organic-theme">
      {/* Animated Background */}
      <BlobBackground />

      {/* Content */}
      <div className="organic-container">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 100 }}
          className="text-center mb-16"
        >
          <h1 className="organic-heading mb-4">Shadow Analyzer</h1>
          <p className="organic-body text-white">
            Flowing through media narratives with fluid intelligence
          </p>
        </motion.header>

        {/* Main Content */}
        <main>
          {/* Idle State - Input */}
          {scrapingStatus === 'idle' && (
            <FloatingCard className="max-w-3xl mx-auto">
              <div className="text-center mb-8">
                <Sparkles className="w-16 h-16 mx-auto mb-4 text-purple-600" />
                <h2 className="organic-subheading mb-3">Begin Your Analysis</h2>
                <p className="organic-body text-gray-600">
                  Enter any article URL to reveal hidden narratives
                </p>
              </div>

              <div className="flex gap-3">
                <input
                  type="url"
                  placeholder="https://example.com/article"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAnalyze()}
                  className="organic-input flex-1"
                />
                <button
                  onClick={handleAnalyze}
                  className="organic-button"
                >
                  <span>Analyze</span>
                </button>
              </div>
            </FloatingCard>
          )}

          {/* Scanning State */}
          {scrapingStatus === 'scanning' && (
            <FloatingCard className="max-w-3xl mx-auto text-center py-16">
              <div className="organic-spinner mx-auto mb-6"></div>
              <h3 className="organic-subheading mb-3">Flowing Through Data...</h3>
              <p className="organic-body text-gray-600">
                Our AI is discovering patterns in the narrative
              </p>
            </FloatingCard>
          )}

          {/* Results State */}
          {scrapingStatus === 'results' && analysisData && (
            <div className="space-y-8">
              {/* Score Header */}
              <FloatingCard delay={0.1} className="text-center">
                <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                  {/* Score Circle */}
                  <motion.div
                    className="organic-score"
                    style={{ background: getScoreColor(analysisData.meta?.score || 0) }}
                    animate={{
                      rotate: [0, 5, -5, 0],
                      y: [0, -10, 0]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <div>{analysisData.meta?.score || 0}</div>
                    <div className="organic-score-label">Risk Score</div>
                  </motion.div>

                  {/* Title & Meta */}
                  <div className="flex-1 text-left">
                    <p className="organic-label mb-2">{getScoreBand(analysisData.meta?.score || 0)}</p>
                    <h2 className="organic-subheading mb-3">{analysisData.title}</h2>
                    <div className="flex gap-4 organic-label">
                      <span>Tone: {analysisData.meta?.tone}</span>
                      <span>•</span>
                      <span>{analysisData.meta?.verdict_short}</span>
                    </div>
                  </div>
                </div>
              </FloatingCard>

              {/* Intent */}
              <FloatingCard delay={0.2}>
                <h3 className="organic-subheading mb-4">Strategic Intent</h3>
                <p className="organic-body text-gray-700">{analysisData.intent}</p>
              </FloatingCard>

              {/* Facts & Axioms Grid */}
              <div className="grid md:grid-cols-2 gap-8">
                {/* Facts */}
                <FloatingCard delay={0.3}>
                  <h3 className="organic-subheading mb-4">Verified Facts</h3>
                  <ul className="organic-list">
                    {analysisData.facts?.map((fact, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + i * 0.1 }}
                      >
                        {fact}
                      </motion.li>
                    ))}
                  </ul>
                </FloatingCard>

                {/* Axioms */}
                <FloatingCard delay={0.4}>
                  <h3 className="organic-subheading mb-4">Hidden Assumptions</h3>
                  <ul className="organic-list">
                    {analysisData.axioms?.map((axiom, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + i * 0.1 }}
                      >
                        {axiom}
                      </motion.li>
                    ))}
                  </ul>
                </FloatingCard>
              </div>

              {/* Narrative Analysis */}
              {analysisData.narrative_analysis && (
                <FloatingCard delay={0.5}>
                  <h3 className="organic-subheading mb-4">Narrative Analysis</h3>
                  <p className="organic-body text-gray-700 whitespace-pre-line">
                    {analysisData.narrative_analysis}
                  </p>
                </FloatingCard>
              )}

              {/* Actions */}
              <div className="text-center pt-8">
                <button
                  onClick={resetAnalysis}
                  className="organic-button inline-flex items-center gap-2"
                >
                  <RefreshCw className="w-5 h-5" />
                  <span>New Analysis</span>
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default OrganicTheme;
