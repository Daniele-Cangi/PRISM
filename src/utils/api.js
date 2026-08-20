const configuredBase = (
  import.meta.env.VITE_API_URL || ""
).replace(/\/$/, "");

const API_BASE = configuredBase || "http://localhost:8001";

export const API_ENDPOINTS = {
  analyze: API_BASE + "/analyze",
  geoRecon: (countryCode) => (
    API_BASE
    + "/recon/geo?country_code="
    + encodeURIComponent(countryCode)
  ),
  rateLimit:
    API_BASE + "/rate-limit",
};

export default API_ENDPOINTS;
