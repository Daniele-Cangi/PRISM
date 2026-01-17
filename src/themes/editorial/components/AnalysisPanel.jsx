import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BarChart3, FileText, Download, ChevronDown, AlertTriangle, CheckCircle, Eye, Share2 } from 'lucide-react';
import '../../scientific/scientific.css';
import DistributionChart from '../../scientific/components/DistributionChart';
import DataGrid from '../../scientific/components/DataGrid';
import StatsSidebar from '../../scientific/components/StatsSidebar';

// Collapsible Section Component for Mobile
const CollapsibleSection = ({ title, icon: Icon, children, defaultOpen = false, accentColor = "#1A1A1A" }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 active:bg-slate-100 transition-colors touch-manipulation"
      >
        <div className="flex items-center gap-3">
          {Icon && <Icon className="w-5 h-5" style={{ color: accentColor }} />}
          <span className="font-semibold text-[#1A1A1A]">{title}</span>
        </div>
        <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 bg-white">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Score Badge Component
const ScoreBadge = ({ score, size = "large" }) => {
  const getScoreColor = (s) => {
    if (s <= 30) return { bg: "#DCFCE7", text: "#166534", border: "#22C55E" };
    if (s <= 60) return { bg: "#FEF3C7", text: "#92400E", border: "#F59E0B" };
    return { bg: "#FEE2E2", text: "#991B1B", border: "#EF4444" };
  };

  const colors = getScoreColor(score);
  const isLarge = size === "large";

  return (
    <div
      className={`flex flex-col items-center justify-center rounded-full border-4 ${isLarge ? 'w-28 h-28' : 'w-16 h-16'}`}
      style={{ backgroundColor: colors.bg, borderColor: colors.border }}
    >
      <span className={`font-bold ${isLarge ? 'text-4xl' : 'text-xl'}`} style={{ color: colors.text }}>
        {score}
      </span>
      <span className={`uppercase tracking-wider font-semibold ${isLarge ? 'text-xs' : 'text-[8px]'}`} style={{ color: colors.text }}>
        Bias
      </span>
    </div>
  );
};

const AnalysisPanel = ({ data, onClose }) => {
  const [mode, setMode] = useState('editorial');
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

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `PRISM Analysis: ${title}`,
          text: `Bias Score: ${meta?.score}% - ${meta?.verdict_short}`,
          url: window.location.href
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`fixed inset-0 bg-white z-50 overflow-y-auto ${mode === 'scientific' ? 'scientific-theme' : 'editorial-theme'}`}
    >
      {/* Mobile Header - Fixed */}
      <div className="sticky top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-slate-200 z-50 lg:relative lg:border-0">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 active:bg-slate-200 rounded-xl transition-all touch-manipulation min-h-[44px]"
          >
            <X className="w-5 h-5 text-slate-600" />
            <span className="text-sm font-semibold text-slate-700 hidden sm:inline">Back</span>
          </button>

          {/* Mode Toggle - Mobile */}
          <div className="bg-slate-100 rounded-xl p-1 flex">
            <button
              onClick={() => setMode('editorial')}
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all touch-manipulation min-h-[40px] ${mode === 'editorial'
                ? 'bg-white text-[#1A1A1A] shadow-sm'
                : 'text-slate-500'
                }`}
            >
              <FileText className="w-4 h-4 lg:hidden" />
              <span className="hidden lg:inline">Editorial</span>
            </button>
            <button
              onClick={() => setMode('scientific')}
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all touch-manipulation min-h-[40px] ${mode === 'scientific'
                ? 'bg-[#DC2626] text-white shadow-sm'
                : 'text-slate-500'
                }`}
            >
              <BarChart3 className="w-4 h-4 lg:hidden" />
              <span className="hidden lg:inline">Scientific</span>
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {navigator.share && (
              <button
                onClick={handleShare}
                className="p-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <Share2 className="w-5 h-5 text-slate-600" />
              </button>
            )}
            <button
              onClick={handleExportCSV}
              className="p-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <Download className="w-5 h-5 text-slate-600" />
            </button>
          </div>
        </div>
      </div>

      {mode === 'editorial' ? (
        /* ---------------- EDITORIAL MODE ---------------- */
        <div className="px-4 pb-8 pt-4 lg:pt-8 max-w-4xl mx-auto">

          {/* Mobile Score Summary Card */}
          <div className="lg:hidden bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-6 mb-6">
            <div className="flex items-start gap-4">
              <ScoreBadge score={meta?.score || 0} />
              <div className="flex-1 min-w-0">
                <div className="text-xs uppercase tracking-wider text-slate-500 mb-1 font-semibold">
                  {meta?.tone || 'Analysis'}
                </div>
                <div className="text-lg font-bold text-[#1A1A1A] mb-2 line-clamp-2">
                  {meta?.verdict_short || 'Verdict'}
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                    <CheckCircle className="w-3 h-3" />
                    {facts?.length || 0} Facts
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                    <AlertTriangle className="w-3 h-3" />
                    {axioms?.length || 0} Hidden
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Title - Mobile optimized */}
          <h1 className="text-xl lg:text-3xl font-serif font-bold text-[#1A1A1A] mb-4 lg:mb-6 leading-tight">
            {title}
          </h1>

          {/* Desktop Score Bar */}
          <div className="hidden lg:flex items-center gap-4 mb-8 p-4 bg-slate-50 rounded-xl">
            <ScoreBadge score={meta?.score || 0} size="small" />
            <div>
              <div className="text-sm text-slate-500">Bias Score: <strong>{meta?.score}%</strong></div>
              <div className="text-sm text-slate-500">Tone: <strong>{meta?.tone}</strong></div>
              <div className="text-sm text-slate-500">Verdict: <strong>{meta?.verdict_short}</strong></div>
            </div>
          </div>

          {/* Strategic Intent - Collapsible on Mobile */}
          <div className="lg:hidden">
            <CollapsibleSection title="Strategic Intent" icon={Eye} defaultOpen={true} accentColor="#DC2626">
              <p className="text-base text-slate-700 leading-relaxed italic border-l-4 border-[#DC2626] pl-4">
                {intent}
              </p>
            </CollapsibleSection>
          </div>

          {/* Desktop Intent */}
          <div className="hidden lg:block my-8">
            <div className="editorial-pullquote">
              {intent}
            </div>
          </div>

          {/* Narrative Analysis - Collapsible on Mobile */}
          {narrative_analysis && (
            <>
              <div className="lg:hidden">
                <CollapsibleSection title="Narrative Analysis" icon={FileText} defaultOpen={false}>
                  <p className="text-base text-slate-700 leading-relaxed whitespace-pre-line">
                    {narrative_analysis}
                  </p>
                </CollapsibleSection>
              </div>

              <div className="hidden lg:block my-8">
                <h2 className="headline-tertiary mb-4">Narrative Analysis</h2>
                <div className="body-text whitespace-pre-line">
                  {narrative_analysis}
                </div>
              </div>
            </>
          )}

          {/* Verified Facts - Collapsible on Mobile */}
          <div className="lg:hidden">
            <CollapsibleSection title={`Verified Facts (${facts?.length || 0})`} icon={CheckCircle} defaultOpen={false} accentColor="#22C55E">
              <ul className="space-y-3">
                {facts?.map((fact, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span className="text-slate-700">{fact}</span>
                  </li>
                ))}
              </ul>
            </CollapsibleSection>
          </div>

          {/* Hidden Axioms - Collapsible on Mobile */}
          <div className="lg:hidden">
            <CollapsibleSection title={`Hidden Assumptions (${axioms?.length || 0})`} icon={AlertTriangle} defaultOpen={false} accentColor="#EF4444">
              <ul className="space-y-3">
                {axioms?.map((axiom, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-red-100 text-red-700 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span className="text-slate-700">{axiom}</span>
                  </li>
                ))}
              </ul>
            </CollapsibleSection>
          </div>

          {/* Desktop Two Column Layout */}
          <div className="hidden lg:grid lg:grid-cols-2 gap-12 my-8">
            <section>
              <h3 className="headline-tertiary mb-6">Verified Facts</h3>
              <ul className="editorial-list">
                {facts?.map((fact, i) => (
                  <li key={i}>{fact}</li>
                ))}
              </ul>
            </section>
            <section>
              <h3 className="headline-tertiary mb-6">Hidden Assumptions</h3>
              <ul className="editorial-list">
                {axioms?.map((axiom, i) => (
                  <li key={i}>{axiom}</li>
                ))}
              </ul>
            </section>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-slate-200 text-center">
            <p className="text-sm text-slate-400">End of Analysis Report</p>
          </div>
        </div>

      ) : (

        /* ---------------- SCIENTIFIC MODE ---------------- */
        <div className="px-4 pb-8 pt-4 lg:pt-8 max-w-6xl mx-auto">

          {/* Mobile Stats Summary */}
          <div className="lg:hidden mb-6">
            <div className="bg-slate-900 rounded-2xl p-5 text-white">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-xs uppercase tracking-wider text-slate-400 mb-1">Bias Index</div>
                  <div className="text-4xl font-bold">{meta?.score || 0}<span className="text-lg text-slate-400">%</span></div>
                </div>
                <div className="text-right">
                  <div className="text-xs uppercase tracking-wider text-slate-400 mb-1">Classification</div>
                  <div className="text-lg font-semibold text-[#DC2626]">{meta?.verdict_short || 'Unknown'}</div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-700">
                <div className="text-center">
                  <div className="text-xl font-bold">{facts?.length || 0}</div>
                  <div className="text-[10px] uppercase text-slate-400">Facts</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold">{axioms?.length || 0}</div>
                  <div className="text-[10px] uppercase text-slate-400">Axioms</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold">{meta?.tone?.charAt(0) || '-'}</div>
                  <div className="text-[10px] uppercase text-slate-400">Tone</div>
                </div>
              </div>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-lg lg:text-2xl font-bold text-[#1A1A1A] mb-2 leading-tight">{title}</h1>
          <p className="text-sm text-slate-500 mb-6">Quantitative Bias Analysis</p>

          {/* Distribution Chart - Collapsible on Mobile */}
          <div className="lg:hidden">
            <CollapsibleSection title="Score Distribution" icon={BarChart3} defaultOpen={true} accentColor="#DC2626">
              <DistributionChart score={meta?.score || 0} />
              <p className="text-xs text-slate-500 mt-2 text-center">
                Position relative to baseline distribution
              </p>
            </CollapsibleSection>
          </div>

          {/* Data Grid - Collapsible on Mobile */}
          <div className="lg:hidden">
            <CollapsibleSection title="Raw Metrics" icon={FileText} defaultOpen={false}>
              <DataGrid data={data} />
            </CollapsibleSection>
          </div>

          {/* Logic Breakdown - Collapsible on Mobile */}
          <div className="lg:hidden">
            <CollapsibleSection title="Logic Deconstruction" icon={Eye} defaultOpen={false}>
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs uppercase tracking-wider mb-2 text-green-600 font-semibold">Verified Facts</h4>
                  <ul className="space-y-2">
                    {facts?.map((f, i) => (
                      <li key={i} className="text-sm text-slate-700 pl-4 border-l-2 border-green-300">{f}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-xs uppercase tracking-wider mb-2 text-red-600 font-semibold">Hidden Axioms</h4>
                  <ul className="space-y-2">
                    {axioms?.map((a, i) => (
                      <li key={i} className="text-sm text-slate-700 pl-4 border-l-2 border-red-300">{a}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </CollapsibleSection>
          </div>

          {/* Desktop Layout */}
          <div className="hidden lg:grid lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-8">
              <div className="sci-figure">
                <div className="sci-figure-number">Figure 1.1</div>
                <h3 className="sci-figure-title">Bias Score Distribution</h3>
                <DistributionChart score={meta?.score || 0} />
                <p className="sci-figure-caption">
                  Relative position of this article's bias score compared to the baseline distribution.
                </p>
              </div>

              <div className="sci-panel">
                <div className="sci-panel-header">
                  <h3 className="sci-panel-title">Table 1: Raw Metrics</h3>
                </div>
                <DataGrid data={data} />
              </div>

              <div className="sci-panel">
                <h3 className="sci-panel-title mb-4">Logic Deconstruction</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="sci-subtitle text-xs uppercase tracking-wider mb-3 text-[#10B981]">Verified Facts</h4>
                    <ul className="sci-list">
                      {facts?.map((f, i) => (
                        <li key={i} className="sci-list-item text-sm">{f}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="sci-subtitle text-xs uppercase tracking-wider mb-3 text-[#EF4444]">Hidden Axioms</h4>
                    <ul className="sci-list">
                      {axioms?.map((a, i) => (
                        <li key={i} className="sci-list-item text-sm">{a}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

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
