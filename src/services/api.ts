/**
 * Frontend API service layer — GreenX
 *
 * Backend base URL is controlled by VITE_API_URL env var.
 * In production (Vercel) set:  VITE_API_URL=https://spring-boot-backend-production-13e6.up.railway.app
 * In local dev leave it empty — Vite proxy forwards /api → http://localhost:8082
 */

export { health, auth, getToken, setToken, clearToken } from '@/lib/api';
export type { AuthUser, LoginResponse, GxNotification } from '@/lib/api';

/**
 * Convenience: check if the backend is reachable and healthy.
 * Usage:  const ok = await checkBackendHealth();
 */
export async function checkBackendHealth(): Promise<boolean> {
    try {
        const { health } = await import('@/lib/api');
        const result = await health.check();
        return result.status === 'UP';
    } catch {
        return false;
    }
}
