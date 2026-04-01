const envUrl = (import.meta.env.VITE_API_URL ?? '').replace(/\/+$/, '');
export const API_BASE_URL = envUrl || '/api';

const trimmedApiBase = API_BASE_URL.replace(/\/+$/, '');
export const WS_BASE_URL = `${trimmedApiBase}/ws`;