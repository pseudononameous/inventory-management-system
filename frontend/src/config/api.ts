/**
 * Single source of truth for API URLs.
 * - Local dev with Vite proxy: VITE_API_HOST=/api, VITE_API_DOMAIN= (empty)
 * - Direct API / production: VITE_API_HOST=http://localhost:8000/api, VITE_API_DOMAIN=http://localhost:8000
 */
const apiHost = import.meta.env.VITE_API_HOST ?? "/api";
const apiDomain = import.meta.env.VITE_API_DOMAIN ?? "";

export const API_HOST = apiHost.endsWith("/") ? apiHost.slice(0, -1) : apiHost;
export const API_DOMAIN = apiDomain.endsWith("/") ? apiDomain.slice(0, -1) : apiDomain;

/** Path under API_HOST for v1 endpoints. Use with axios (baseURL=API_HOST) to avoid /api/api/ duplication. */
export const API_V1 = "/v1";
