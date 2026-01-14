import { lazy } from 'react';

/**
 * Theme Registry
 * Central configuration for all available themes
 * Uses lazy loading to reduce initial bundle size
 */

// Lazy load theme components
const EditorialTheme = lazy(() => import('./editorial/EditorialTheme'));
const ScientificTheme = lazy(() => import('./scientific/ScientificTheme'));
const BrutalistTheme = lazy(() => import('./brutalist/BrutalistTheme'));
const OrganicTheme = lazy(() => import('./organic/OrganicTheme'));
const RetroTheme = lazy(() => import('./retro/RetroTheme'));
const GenerativeTheme = lazy(() => import('./generative/GenerativeTheme'));

/**
 * THEMES Registry
 * Each theme must implement the same interface:
 * - Receives analysis data via Zustand store
 * - Handles URL mode and GEO mode
 * - Shows loading/idle/results states
 */
export const THEMES = {
  editorial: {
    id: 'editorial',
    name: 'Editorial Clarity',
    component: EditorialTheme,
    description: 'Premium publishing aesthetic (NYT, The Atlantic)',
    primaryColor: '#DC2626',
    preview: '📰',
    category: 'Professional'
  },
  scientific: {
    id: 'scientific',
    name: 'Scientific Precision',
    component: ScientificTheme,
    description: 'Academic journal layout (Nature, Science)',
    primaryColor: '#2563EB',
    preview: '📊',
    category: 'Professional'
  },
  brutalist: {
    id: 'brutalist',
    name: 'Brutalist Minimalism',
    component: BrutalistTheme,
    description: 'Extreme reduction (Craigslist, HN)',
    primaryColor: '#0000EE',
    preview: '⬛',
    category: 'Minimal'
  },
  organic: {
    id: 'organic',
    name: 'Organic Fluidity',
    component: OrganicTheme,
    description: 'Biomorphic, flowing (Apple, Stripe)',
    primaryColor: '#8B5CF6',
    preview: '🌊',
    category: 'Modern'
  },
  retro: {
    id: 'retro',
    name: 'Retro Terminal',
    component: RetroTheme,
    description: '1980s computing (amber monitor, DOS)',
    primaryColor: '#FFB000',
    preview: '💻',
    category: 'Retro'
  },
  generative: {
    id: 'generative',
    name: 'Generative Canvas',
    component: GenerativeTheme,
    description: 'Experimental art (Processing, p5.js)',
    primaryColor: '#10B981',
    preview: '✨',
    category: 'Experimental'
  }
};

/**
 * Get theme by ID
 * @param {string} themeId - Theme identifier
 * @returns {object|null} - Theme configuration or null
 */
export const getTheme = (themeId) => {
  return THEMES[themeId] || null;
};

/**
 * Get all theme IDs
 * @returns {array} - Array of theme IDs
 */
export const getAllThemeIds = () => {
  return Object.keys(THEMES);
};

/**
 * Get themes grouped by category
 * @returns {object} - Themes grouped by category
 */
export const getThemesByCategory = () => {
  const grouped = {};

  Object.values(THEMES).forEach(theme => {
    const category = theme.category || 'Other';
    if (!grouped[category]) grouped[category] = [];
    grouped[category].push(theme);
  });

  return grouped;
};

export default THEMES;
