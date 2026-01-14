// API configuration for development and production
const isDev = import.meta.env.DEV;

// In development, use local backend server
// In production (Vercel), use serverless functions
const API_BASE = isDev ? 'http://localhost:8001' : '/api';

export const API_ENDPOINTS = {
  analyze: `${API_BASE}/analyze`,
  geoRecon: (countryCode) => `${API_BASE}/recon/geo?country_code=${countryCode}`,
};

export default API_ENDPOINTS;
