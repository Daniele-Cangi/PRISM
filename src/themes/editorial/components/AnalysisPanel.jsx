import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, BarChart3, FileText, Download } from 'lucide-react';
import '../../scientific/scientific.css';
import DistributionChart from '../../scientific/components/DistributionChart';
import DataGrid from '../../scientific/components/DataGrid';
import StatsSidebar from '../../scientific/components/StatsSidebar';

const AnalysisPanel = ({ data, onClose }) => {
  const [mode, setMode] = useState('editorial'); // 'editorial' | 'scientific'
  const { title, intent, facts, axioms, narrative_analysis, meta } = data;

  const handleExportCSV = () => {
    const csv = [
      ['Metric', 'Value'],
      ['Title', title],
      ['Score', meta?.score || 0],
      ['Tone', meta?.tone || 'Unknown'],
      ['Verdict', meta?.verdict_short || 'Unknown'],
      ['Facts Count', facts?.length || 0],
      ['Axioms Count', axioms?.length || 0]
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analysis-${Date.now()}.csv`;
    a.click();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`fixed inset-0 bg-white z-50 overflow-y-auto ${mode === 'scientific' ? 'scientific-theme' : 'editorial-theme'}`}
    >
      {/* Fixed Back Button */}
      <div className="fixed top-0 left-0 p-6 z-50">
        <button
          onClick={onClose}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-sm transition-all group"
        >
          <X className="w-5 h-5 text-slate-500 group-hover:text-[#DC2626]" />
          <span className="text-sm font-semibold text-slate-700 group-hover:text-[#1A1A1A]">Back to Monitor</span>
        </button>
      </div>

      {mode === 'editorial' ? (
        /* ---------------- EDITORIAL MODE ---------------- */
        <div className="editorial-container pt-24 pb-16">
          {/* Header */}
          <header className="mb-12">
            <div className="editorial-meta mb-4">
              <span>Full Analysis</span>
              <div className="editorial-meta-divider" />
              <span>{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            </div>

            <h1 className="headline-primary">{title}</h1>

            <div className="editorial-meta mt-4">
              <span>Bias Score: {meta?.score}%</span>
              <div className="editorial-meta-divider" />
              <span>Tone: {meta?.tone}</span>
              <div className="editorial-meta-divider" />
              <span>Verdict: {meta?.verdict_short}</span>
            </div>

            {/* Mode Toggle - Below Title */}
            <div className="flex justify-center mt-8">
              <div className="bg-slate-100 border border-slate-200 rounded-lg p-1 flex">
                <button
                  onClick={() => setMode('editorial')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-all ${mode === 'editorial'
                    ? 'bg-[#1A1A1A] text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                    }`}
                >
                  <FileText className="w-4 h-4" />
                  Editorial
                </button>
                <button
                  onClick={() => setMode('scientific')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-all ${mode === 'scientific'
                    ? 'bg-[#DC2626] text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                    }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  Scientific
                </button>
              </div>
            </div>
          </header>

          <div className="editorial-divider-thick" />

          {/* Strategic Intent */}
          <section className="my-12">
            <div className="editorial-pullquote">
              {intent}
            </div>
          </section>

          {/* Narrative Analysis */}
          {narrative_analysis && (
            <section className="my-12">
              <h2 className="headline-tertiary mb-6">Narrative Analysis</h2>
              <div className="body-text whitespace-pre-line">
                {narrative_analysis}
              </div>
            </section>
          )}

          <div className="editorial-divider" />

          {/* Two Column Layout for Facts & Axioms */}
          <div className="grid md:grid-cols-2 gap-12 my-12">
            {/* Verified Facts */}
            <section>
              <h3 className="headline-tertiary mb-6">Verified Facts</h3>
              <ul className="editorial-list">
                {facts.map((fact, i) => (
                  <li key={i}>{fact}</li>
                ))}
              </ul>
            </section>

            {/* Hidden Axioms */}
            <section>
              <h3 className="headline-tertiary mb-6">Hidden Assumptions</h3>
              <ul className="editorial-list">
                {axioms.map((axiom, i) => (
                  <li key={i}>{axiom}</li>
                ))}
              </ul>
            </section>
          </div>

          <div className="editorial-divider" />

          {/* Footer */}
          <footer className="mt-12 text-center">
            <p className="caption">End of Editorial Report</p>
          </footer>
        </div>

      ) : (

        /* ---------------- SCIENTIFIC MODE ---------------- */
        <div className="sci-container pt-24 pb-16">
          <header className="mb-8 border-b border-slate-200 pb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="sci-title">{title}</h1>
                <p className="sci-subtitle mt-2 text-[#6B7280]">Quantitative Bias Analysis & Metrics</p>
              </div>
              <button
                onClick={handleExportCSV}
                className="sci-button flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export Data
              </button>
            </div>

            {/* Mode Toggle - Below Title */}
            <div className="flex justify-center mt-6">
              <div className="bg-slate-100 border border-slate-200 rounded-lg p-1 flex">
                <button
                  onClick={() => setMode('editorial')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-all ${mode === 'editorial'
                    ? 'bg-[#1A1A1A] text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                    }`}
                >
                  <FileText className="w-4 h-4" />
                  Editorial
                </button>
                <button
                  onClick={() => setMode('scientific')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-all ${mode === 'scientific'
                    ? 'bg-[#DC2626] text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                    }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  Scientific
                </button>
              </div>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Main Visualization Column */}
            <div className="lg:col-span-8 space-y-8">
              {/* Distribution Chart */}
              <div className="sci-figure">
                <div className="sci-figure-number">Figure 1.1</div>
                <h3 className="sci-figure-title">Bias Score Distribution</h3>
                <DistributionChart score={meta?.score || 0} />
                <p className="sci-figure-caption">
                  Relative position of this article's bias score compared to the baseline distribution.
                </p>
              </div>

              {/* Data Grid */}
              <div className="sci-panel">
                <div className="sci-panel-header">
                  <h3 className="sci-panel-title">Table 1: Raw Metrics</h3>
                </div>
                <DataGrid data={data} />
              </div>

              {/* Deep Logic Breakdown */}
              <div className="sci-panel">
                <h3 className="sci-panel-title mb-4">Logic Deconstruction</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="sci-subtitle text-xs uppercase tracking-wider mb-3 text-[#10B981]">Verified Facts</h4>
                    <ul className="sci-list">
                      {facts.map((f, i) => (
                        <li key={i} className="sci-list-item text-sm">{f}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="sci-subtitle text-xs uppercase tracking-wider mb-3 text-[#EF4444]">Hidden Axioms</h4>
                    <ul className="sci-list">
                      {axioms.map((a, i) => (
                        <li key={i} className="sci-list-item text-sm">{a}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar Stats */}
            <div className="lg:col-span-4">
              <div className="sticky top-24">
                <StatsSidebar data={data} />
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default AnalysisPanel;
