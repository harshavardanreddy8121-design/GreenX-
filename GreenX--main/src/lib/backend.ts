// VITE_API_URL must be set in Vercel → Settings → Environment Variables.
// Fallback to the known Railway backend so the app works even if the env var
// is missing (avoids 404s when Vercel serves /api as a static path).
const RAILWAY_BACKEND = 'https://spring-boot-backend-production-13e6.up.railway.app/api';

const rawEnvUrl = (import.meta.env.VITE_API_URL ?? '').replace(/\/+$/, '');

// Reject relative paths (e.g. "/api") — they would 404 on Vercel's static host.
// Only accept fully-qualified URLs that start with "http".
const envUrl = rawEnvUrl.startsWith('http') ? rawEnvUrl : '';

if (!envUrl) {
  if (rawEnvUrl) {
    // A value was provided but it looks like a relative path — warn loudly.
    console.warn(
      '[GreenX] VITE_API_URL is set to a relative path ("' + rawEnvUrl + '") which will 404 on Vercel. ' +
      'Falling back to the Railway backend URL.'
    );
  } else {
    console.warn(
      '[GreenX] VITE_API_URL is not set. ' +
      'Falling back to the Railway backend URL. ' +
      'Set VITE_API_URL=https://spring-boot-backend-production-13e6.up.railway.app/api in Vercel → Settings → Environment Variables.'
    );
  }
}

export const API_BASE_URL = envUrl || RAILWAY_BACKEND;

const trimmedApiBase = API_BASE_URL.replace(/\/+$/, '');
export const WS_BASE_URL = `${trimmedApiBase}/ws`;

// Always log the active API URL so it is visible in the browser console
// regardless of environment — makes debugging Vercel deployments easier.
console.log('[GreenX] API_BASE_URL =', API_BASE_URL);