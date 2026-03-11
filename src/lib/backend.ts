const envUrl = (import.meta.env.VITE_API_URL ?? '').replace(/\/+$/, '');
// When VITE_API_URL is set (production), append /api so requests hit the
// backend context path. In local dev the Vite proxy already handles /api.
export const API_BASE_URL = envUrl ? `${envUrl}/api` : '/api';

const trimmedApiBase = API_BASE_URL.replace(/\/+$/, '');
export const WS_BASE_URL = `${trimmedApiBase}/ws`;