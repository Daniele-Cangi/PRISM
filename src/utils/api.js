// API configuration for development and production
const isDev = import.meta.env.DEV;

// In development, use local backend server
// In production, use Render backend API
// IMPORTANT: Replace with your actual Render URL after deploy
const RENDER_API_URL = import.meta.env.VITE_API_URL || 'https://shadow-analyzer-api.onrender.com';
const API_BASE = isDev ? 'http://localhost:8001' : RENDER_API_URL;

export const API_ENDPOINTS = {
  analyze: `${API_BASE}/analyze`,
  geoRecon: (countryCode) => `${API_BASE}/recon/geo?country_code=${countryCode}`,
  rateLimit: `${API_BASE}/rate-limit`,
};

export default API_ENDPOINTS;
