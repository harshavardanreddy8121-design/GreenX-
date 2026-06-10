/**
 * API Configuration Validator
 * Ensures the application is properly configured before making any API calls.
 */

export function validateAPIConfiguration(): void {
    const apiUrl = import.meta.env.VITE_API_URL;

    if (!apiUrl) {
        // No env var set — backend.ts will fall back to the hardcoded Railway URL.
        if (import.meta.env.DEV) {
            console.warn('[GreenX] VITE_API_URL not set — using Railway fallback URL.');
        }
        return;
    }

    if (!apiUrl.startsWith('http://') && !apiUrl.startsWith('https://')) {
        console.warn('[GreenX] VITE_API_URL should be an absolute URL. Current value:', apiUrl);
    }

    if (import.meta.env.DEV) {
        console.log('[GreenX] API configured:', apiUrl);
    }
}

// Run validation on import
validateAPIConfiguration();
