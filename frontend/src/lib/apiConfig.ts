/**
 * API Configuration Validator
 * Ensures the application is properly configured before making any API calls.
 * Also bootstraps a demo JWT token so the dashboard works without a login flow.
 */

const TOKEN_KEY = 'greenx_token';

/**
 * Fetches a demo JWT token from the backend and stores it in localStorage.
 * Called once on app load when no token is present. This allows the dashboard
 * to reach protected endpoints without requiring the user to log in.
 */
export async function initDemoToken(): Promise<void> {
    // Skip if a token is already stored
    if (localStorage.getItem(TOKEN_KEY)) return;

    const apiUrl = import.meta.env.VITE_API_URL;
    if (!apiUrl) return; // Can't fetch without a base URL

    const base = apiUrl.replace(/\/+$/, '');

    try {
        const res = await fetch(`${base}/auth/demo-token`);
        if (!res.ok) {
            console.warn('⚠️ Demo token fetch returned non-OK status:', res.status);
            return;
        }

        const json = await res.json();

        // Backend wraps responses in { success, data, error }
        const token: string | undefined =
            json?.data?.token ?? json?.token;

        if (token) {
            localStorage.setItem(TOKEN_KEY, token);
            // Keep javaApiToken in sync for any secondary API clients
            localStorage.setItem('javaApiToken', token);
            if (import.meta.env.DEV) {
                console.log('✅ Demo token acquired and stored in localStorage');
            }
        } else {
            console.warn('⚠️ Demo token response did not contain a token:', json);
        }
    } catch (err) {
        console.warn('⚠️ Could not fetch demo token:', err);
    }
}

export function validateAPIConfiguration(): void {
    const apiUrl = import.meta.env.VITE_API_URL;
    
    // Check if VITE_API_URL is set
    if (!apiUrl) {
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.error('❌ CRITICAL ERROR: VITE_API_URL is not set!');
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.error('');
        console.error('The application cannot make API calls without this configuration.');
        console.error('');
        console.error('To fix this:');
        console.error('1. Go to Vercel Dashboard → Your Project');
        console.error('2. Settings → Environment Variables');
        console.error('3. Add:');
        console.error('   Name: VITE_API_URL');
        console.error('   Value: https://spring-boot-backend-production-13e6.up.railway.app/api');
        console.error('   Environments: ✅ Production, ✅ Preview, ✅ Development');
        console.error('4. Redeploy the application');
        console.error('');
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        // Show user-friendly error
        if (typeof window !== 'undefined') {
            const errorDiv = document.createElement('div');
            errorDiv.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                background: #dc2626;
                color: white;
                padding: 16px;
                text-align: center;
                z-index: 9999;
                font-family: system-ui, sans-serif;
            `;
            errorDiv.innerHTML = `
                <strong>⚠️ Configuration Error</strong><br>
                Backend API URL is not configured. Please check environment variables.
            `;
            document.body?.appendChild(errorDiv);
        }
        
        return;
    }
    
    // Check if URL is absolute
    if (!apiUrl.startsWith('http://') && !apiUrl.startsWith('https://')) {
        console.warn('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.warn('⚠️ WARNING: VITE_API_URL should be an absolute URL');
        console.warn('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.warn('Current value:', apiUrl);
        console.warn('Expected format: https://your-backend.up.railway.app/api');
        console.warn('');
        console.warn('Relative URLs will cause API calls to hit Vercel instead of the backend!');
        console.warn('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    }
    
    // Success message
    if (import.meta.env.DEV) {
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✅ API Configuration Valid');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('Backend URL:', apiUrl);
        console.log('Mode:', import.meta.env.MODE);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    }
}

// Run validation on import
validateAPIConfiguration();

// Bootstrap demo token so protected endpoints work without a login flow
initDemoToken();
