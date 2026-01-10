/**
 * Shared utility functions for formatting analysis data
 * Theme-agnostic logic that can be used across all themes
 */

/**
 * Categorize score into risk bands
 * @param {number} score - Score from 0-100
 * @returns {string} - Risk category
 */
export const getScoreBand = (score) => {
  if (score < 30) return 'Neutral';
  if (score < 70) return 'Leaning';
  return 'Propaganda';
};

/**
 * Get color based on score (for themes that need it)
 * @param {number} score - Score from 0-100
 * @returns {object} - Color values in different formats
 */
export const getScoreColor = (score) => {
  if (score < 30) {
    return {
      hex: '#059669',
      rgb: 'rgb(5, 150, 105)',
      hsl: 'hsl(160, 94%, 30%)',
      name: 'success'
    };
  }
  if (score < 70) {
    return {
      hex: '#d97706',
      rgb: 'rgb(217, 119, 6)',
      hsl: 'hsl(32, 95%, 44%)',
      name: 'warning'
    };
  }
  return {
    hex: '#dc2626',
    rgb: 'rgb(220, 38, 38)',
    hsl: 'hsl(0, 84%, 60%)',
    name: 'danger'
  };
};

/**
 * Truncate text to specified length with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} - Truncated text
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

/**
 * Format date for display
 * @param {Date|string} date - Date to format
 * @param {string} format - Format type ('short', 'long', 'relative')
 * @returns {string} - Formatted date string
 */
export const formatDate = (date, format = 'short') => {
  if (!date) return 'Unknown';

  const d = typeof date === 'string' ? new Date(date) : date;

  if (format === 'short') {
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  if (format === 'long') {
    return d.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Relative time
  const now = new Date();
  const diffMs = now - d;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return formatDate(date, 'short');
};

/**
 * Extract key statistics from analysis data
 * @param {object} data - Analysis data
 * @returns {object} - Statistics object
 */
export const getAnalysisStats = (data) => {
  if (!data) return null;

  return {
    score: data.meta?.score || 0,
    scoreBand: getScoreBand(data.meta?.score || 0),
    tone: data.meta?.tone || 'Unknown',
    verdict: data.meta?.verdict_short || 'Unknown',
    factCount: data.facts?.length || 0,
    axiomCount: data.axioms?.length || 0,
    hasNarrative: !!data.narrative_analysis
  };
};

/**
 * Validate analysis data structure
 * @param {object} data - Data to validate
 * @returns {boolean} - True if valid
 */
export const isValidAnalysisData = (data) => {
  return !!(
    data &&
    data.title &&
    data.meta &&
    typeof data.meta.score === 'number' &&
    Array.isArray(data.facts) &&
    Array.isArray(data.axioms)
  );
};

/**
 * Parse GEO intel data
 * @param {array} intelData - Raw intel feed data
 * @returns {array} - Formatted intel items
 */
export const formatGeoIntel = (intelData) => {
  if (!Array.isArray(intelData)) return [];

  return intelData.map((item, index) => ({
    id: item.id || `intel-${index}`,
    title: item.title || 'Untitled',
    source: item.source || 'Unknown',
    url: item.url || '#',
    published: item.published ? formatDate(item.published, 'relative') : 'Recent',
    rawDate: item.published
  }));
};

/**
 * Calculate score distribution for data visualization
 * @param {array} analysisHistory - Array of analysis results
 * @returns {object} - Distribution data
 */
export const getScoreDistribution = (analysisHistory) => {
  if (!Array.isArray(analysisHistory) || analysisHistory.length === 0) {
    return { neutral: 0, leaning: 0, propaganda: 0 };
  }

  const distribution = { neutral: 0, leaning: 0, propaganda: 0 };

  analysisHistory.forEach(item => {
    const score = item.meta?.score || 0;
    const band = getScoreBand(score);

    if (band === 'Neutral') distribution.neutral++;
    else if (band === 'Leaning') distribution.leaning++;
    else distribution.propaganda++;
  });

  return distribution;
};

/**
 * Map score to HSL hue (for generative theme)
 * @param {number} score - Score 0-100
 * @returns {number} - Hue value 0-360 (green to red)
 */
export const scoreToHue = (score) => {
  // Map 0-100 to 120-0 (green to red on HSL wheel)
  return 120 - (score * 1.2);
};
