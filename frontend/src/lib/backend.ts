// VITE_API_URL must be set in Vercel → Settings → Environment Variables.
// The Railway backend URL is always used as the primary/fallback to prevent
// requests being sent to relative /api paths (which 404 on static hosts).
const RAILWAY_BACKEND = 'https://spring-boot-backend-production-13e6.up.railway.app/api';

const envUrl = (import.meta.env.VITE_API_URL ?? '').replace(/\/+$/, '');

// Always prefer the Railway backend URL. Only use VITE_API_URL when it is an
// absolute HTTP(S) URL — reject relative paths that would silently 404.
const isAbsoluteUrl = envUrl.startsWith('http://') || envUrl.startsWith('https://');
export const API_BASE_URL = isAbsoluteUrl ? envUrl : RAILWAY_BACKEND;

// WebSocket URL
const trimmedApiBase = API_BASE_URL.replace(/\/+$/, '');
export const WS_BASE_URL = `${trimmedApiBase}/ws`;

// Always log the resolved API URL so it is visible in production DevTools too.
console.log('[GreenX] API_BASE_URL =', API_BASE_URL);
if (!isAbsoluteUrl && envUrl) {
  console.warn(
    '[GreenX] VITE_API_URL is not an absolute URL ("' + envUrl + '") — ignoring and using Railway backend.'
  );
}
if (!envUrl) {
  console.warn('[GreenX] VITE_API_URL is not set — using Railway backend URL.');
}