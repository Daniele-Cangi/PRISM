const isDev = import.meta.env.DEV;
const configuredBase = (
  import.meta.env.VITE_API_URL || ""
).replace(/\/$/, "");

const API_BASE = configuredBase
  || (isDev ? "http://localhost:8001" : "");
const API_PREFIX =
  configuredBase || isDev ? "" : "/api";

export const API_ENDPOINTS = {
  analyze: API_BASE + API_PREFIX + "/analyze",
  geoRecon: (countryCode) => (
    API_BASE
    + API_PREFIX
    + "/recon/geo?country_code="
    + encodeURIComponent(countryCode)
  ),
  rateLimit:
    API_BASE + API_PREFIX + "/rate-limit",
};

export default API_ENDPOINTS;
