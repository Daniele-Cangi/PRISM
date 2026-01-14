import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { getScoreBand } from '../../../utils/formatAnalysis';

const StatsSidebar = ({ data }) => {
  if (!data) return null;

  const score = data.meta?.score || 0;
  const band = getScoreBand(score);
  const factCount = data.facts?.length || 0;
  const axiomCount = data.axioms?.length || 0;

  // Calculate derived statistics
  const totalClaims = factCount + axiomCount;
  const biasRatio = totalClaims > 0 ? ((axiomCount / totalClaims) * 100).toFixed(1) : 0;

  const getTrendIcon = () => {
    if (score < 30) return <TrendingDown className="w-5 h-5 text-gray-500" />;
    if (score < 70) return <Minus className="w-5 h-5 text-gray-700" />;
    return <TrendingUp className="w-5 h-5 text-[#DC2626]" />;
  };

  const getColor = () => {
    if (score < 30) return '#525252'; // Neutral Gray
    if (score < 70) return '#404040'; // Darker Gray
    return '#DC2626'; // Editorial Red
  };

  const stats = [
    {
      label: 'Bias Score',
      value: score,
      unit: '%',
      description: `Classification: ${band}`
    },
    {
      label: 'Verified Facts',
      value: factCount,
      unit: '',
      description: 'Factual statements'
    },
    {
      label: 'Hidden Axioms',
      value: axiomCount,
      unit: '',
      description: 'Implicit assumptions'
    },
    {
      label: 'Bias Ratio',
      value: biasRatio,
      unit: '%',
      description: 'Axioms vs. total claims'
    }
  ];

  return (
    <div className="space-y-4">
      {/* Summary Card */}
      <div className="sci-panel">
        <div className="sci-panel-header">
          <div>
            <h3 className="sci-panel-title">Statistical Summary</h3>
            <p className="sci-panel-subtitle">Key metrics from analysis</p>
          </div>
          {getTrendIcon()}
        </div>

        <div className="space-y-4">
          {stats.map((stat, i) => (
            <div key={i} className="sci-stat-card border-l-4" style={{ borderLeftColor: i === 0 ? getColor() : '#E5E7EB' }}>
              <div className="sci-stat-value" style={{ color: i === 0 ? getColor() : '#1A1A1A' }}>
                {stat.value}{stat.unit}
              </div>
              <div className="sci-stat-label">{stat.label}</div>
              <div className="sci-caption mt-2">{stat.description}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Distribution Info */}
      <div className="sci-panel">
        <h4 className="sci-panel-title mb-3">Score Distribution</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Neutral (0-30)</span>
            <span className="sci-badge-neutral sci-badge">Low Risk</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Leaning (30-70)</span>
            <span className="sci-badge-leaning sci-badge">Medium</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Propaganda (70-100)</span>
            <span className="sci-badge-propaganda sci-badge">High Risk</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsSidebar;
