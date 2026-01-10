import React from 'react';
import { motion } from 'framer-motion';
import { Search, BarChart3, Download, RefreshCw } from 'lucide-react';
import useAnalysisStore from '../../store/analysisStore';
import DistributionChart from './components/DistributionChart';
import DataGrid from './components/DataGrid';
import StatsSidebar from './components/StatsSidebar';
import './scientific.css';

const ScientificTheme = () => {
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
      alert('Analysis failed. Please verify the URL and try again.');
    }
  };

  const handleExportCSV = () => {
    if (!analysisData) return;

    const csv = [
      ['Metric', 'Value'],
      ['Title', analysisData.title],
      ['Score', analysisData.meta?.score || 0],
      ['Tone', analysisData.meta?.tone || 'Unknown'],
      ['Verdict', analysisData.meta?.verdict_short || 'Unknown'],
      ['Facts Count', analysisData.facts?.length || 0],
      ['Axioms Count', analysisData.axioms?.length || 0]
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analysis-${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="scientific-theme">
      {/* Header */}
      <header className="border-b border-[#E5E7EB] bg-white">
        <div className="sci-container">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="sci-title">Shadow Analyzer</h1>
              <p className="sci-caption mt-1">Computational Analysis of Media Bias</p>
            </div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-gray-500" />
              <span className="sci-label">Scientific Mode</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="sci-container">
        {/* Search Panel */}
        {scrapingStatus === 'idle' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="sci-panel mt-8"
          >
            <div className="sci-panel-header">
              <div>
                <h2 className="sci-panel-title">Data Acquisition</h2>
                <p className="sci-panel-subtitle">Enter article URL for quantitative analysis</p>
              </div>
            </div>

            <div className="flex gap-3">
              <input
                type="url"
                placeholder="https://example.com/article"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAnalyze()}
                className="sci-input flex-1"
              />
              <button
                onClick={handleAnalyze}
                className="sci-button-primary sci-button flex items-center gap-2"
              >
                <Search className="w-4 h-4" />
                Analyze
              </button>
            </div>
          </motion.div>
        )}

        {/* Scanning State */}
        {scrapingStatus === 'scanning' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="sci-panel mt-8 text-center py-12"
          >
            <RefreshCw className="w-12 h-12 mx-auto mb-4 animate-spin text-blue-600" />
            <h3 className="sci-subtitle">Processing Data...</h3>
            <p className="sci-caption mt-2">Running statistical analysis on article content</p>
          </motion.div>
        )}

        {/* Results */}
        {scrapingStatus === 'results' && analysisData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8"
          >
            {/* Actions Bar */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="sci-title">Analysis Results</h2>
              <div className="flex gap-2">
                <button
                  onClick={handleExportCSV}
                  className="sci-button flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export CSV
                </button>
                <button
                  onClick={resetAnalysis}
                  className="sci-button flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  New Analysis
                </button>
              </div>
            </div>

            {/* Grid Layout: Main Content + Sidebar */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Main Panels */}
              <div className="lg:col-span-8 space-y-6">
                {/* Figure 1: Distribution */}
                <div className="sci-figure">
                  <div className="sci-figure-number">Figure 1.1</div>
                  <h3 className="sci-figure-title">Score Distribution Analysis</h3>
                  <DistributionChart score={analysisData.meta?.score || 0} />
                  <p className="sci-figure-caption">
                    Histogram showing bias score distribution across sample dataset.
                    Current article score (blue) is positioned within the distribution.
                  </p>
                </div>

                {/* Table 1: Data Grid */}
                <div className="sci-panel">
                  <div className="sci-panel-header">
                    <div>
                      <h3 className="sci-panel-title">Table 1: Analysis Data</h3>
                      <p className="sci-panel-subtitle">Structured overview of article metrics</p>
                    </div>
                  </div>
                  <DataGrid data={analysisData} />
                </div>

                {/* Analysis Details */}
                <div className="sci-panel">
                  <div className="sci-panel-header">
                    <h3 className="sci-panel-title">Detailed Findings</h3>
                  </div>

                  <div className="space-y-6">
                    {/* Intent */}
                    <div>
                      <h4 className="sci-subtitle mb-2">Strategic Intent</h4>
                      <p className="sci-body">{analysisData.intent}</p>
                    </div>

                    <div className="sci-divider" />

                    {/* Facts */}
                    <div>
                      <h4 className="sci-subtitle mb-3">Verified Facts (n={analysisData.facts?.length})</h4>
                      <ul className="sci-list">
                        {analysisData.facts?.map((fact, i) => (
                          <li key={i} className="sci-list-item">
                            <div className="sci-list-marker">{i + 1}</div>
                            <span className="sci-body">{fact}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="sci-divider" />

                    {/* Axioms */}
                    <div>
                      <h4 className="sci-subtitle mb-3">Hidden Axioms (n={analysisData.axioms?.length})</h4>
                      <ul className="sci-list">
                        {analysisData.axioms?.map((axiom, i) => (
                          <li key={i} className="sci-list-item">
                            <div className="sci-list-marker">{i + 1}</div>
                            <span className="sci-body">{axiom}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Narrative */}
                    {analysisData.narrative_analysis && (
                      <>
                        <div className="sci-divider" />
                        <div>
                          <h4 className="sci-subtitle mb-2">Narrative Analysis</h4>
                          <p className="sci-body whitespace-pre-line">{analysisData.narrative_analysis}</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-4">
                <StatsSidebar data={analysisData} />
              </div>
            </div>
          </motion.div>
        )}
      </main>

      {/* Footer */}
      <footer className="sci-container border-t border-[#E5E7EB] mt-16 pt-8 pb-8">
        <div className="text-center">
          <p className="sci-caption">
            Methodology based on computational linguistics and statistical analysis • Peer-reviewed approach
          </p>
        </div>
      </footer>
    </div>
  );
};

export default ScientificTheme;
