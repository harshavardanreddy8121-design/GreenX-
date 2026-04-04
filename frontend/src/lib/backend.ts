// Get API URL from environment variable
const envUrl = import.meta.env.VITE_API_URL;

// Validate and set API base URL
if (!envUrl) {
  console.error('❌ VITE_API_URL is not set! API calls will fail.');
  console.error('Set VITE_API_URL in Vercel environment variables to your Railway backend URL');
}

// Always use the full URL from environment variable
// Remove trailing slashes for consistent URL construction
export const API_BASE_URL = (envUrl || '').replace(/\/+$/, '');

// WebSocket URL
const trimmedApiBase = API_BASE_URL.replace(/\/+$/, '');
export const WS_BASE_URL = `${trimmedApiBase}/ws`;

// Log for debugging (only in development)
if (import.meta.env.DEV) {
  console.log('🔗 API Base URL:', API_BASE_URL);
  console.log('🔗 WebSocket URL:', WS_BASE_URL);
}