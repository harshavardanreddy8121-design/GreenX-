// VITE_API_URL must be set in Vercel → Settings → Environment Variables.
// Fallback to the known Railway backend so the app works even if the env var
// is missing (avoids 404s when Vercel serves /api as a static path).
const RAILWAY_BACKEND = 'https://spring-boot-backend-production-13e6.up.railway.app/api';

const envUrl = (import.meta.env.VITE_API_URL ?? '').replace(/\/+$/, '');
export const API_BASE_URL = envUrl || RAILWAY_BACKEND;

const trimmedApiBase = API_BASE_URL.replace(/\/+$/, '');
export const WS_BASE_URL = `${trimmedApiBase}/ws`;

if (import.meta.env.DEV) {
  console.log('[GreenX] API_BASE_URL =', API_BASE_URL);
}