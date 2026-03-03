

## Fix Plan: Mobile Login, Weather, and Visual Edits

### Problem Analysis

1. **Mobile Login Failing ("fetching failed")**: The auth logs show repeated `400: Invalid login credentials` errors. The login code itself is correct, but there are two issues:
   - The PWA service worker may be caching auth requests, causing "fetching failed" on mobile
   - No network error handling -- if the fetch itself fails (poor mobile connection), the user gets no feedback
   - The `btn-gradient` custom class may not have proper touch interaction styles (no `cursor-pointer`, missing tap highlight)

2. **Weather Not Working**: The edge function code is correct but may not be deployed. Need to verify deployment and ensure the widget handles errors gracefully instead of silently hiding.

3. **Visual Edits**: The `componentTagger` (which powers visual editing) only runs in `mode === "development"`. This is expected -- visual edits work in the Lovable editor preview, not on the published/mobile app. No code change needed here.

---

### Changes

#### 1. Fix Mobile Login (src/pages/Login.tsx)
- Add network error handling with user-friendly messages ("Check your internet connection")
- Add `type="button"` to all non-submit buttons to prevent accidental form submissions on mobile
- Add proper touch-friendly styles to buttons (explicit `cursor-pointer`, remove any touch-action conflicts)
- Show clearer error messages for "Invalid login credentials" (e.g., "Wrong email or password")
- Add a loading state to Google sign-in button

#### 2. Fix PWA Service Worker Caching (vite.config.ts)
- Add auth/API endpoints to `navigateFallbackDenylist` so the service worker never intercepts authentication requests
- Add `runtimeCaching` rules to ensure Supabase API calls are always network-first (not cached)

#### 3. Improve Weather Widget Resilience (src/components/WeatherWidget.tsx)
- Show a fallback message when weather fails instead of returning null
- Add retry button for failed weather fetches
- Handle edge function not-deployed scenario gracefully

#### 4. Fix Global Button Styles (src/index.css)
- Add `cursor-pointer` and mobile tap styles to `.btn-gradient` utility class
- Ensure touch targets are at least 44px (Apple HIG minimum)

#### 5. Redeploy Weather Edge Function
- Use the deploy tool to ensure `get-weather` edge function is live

---

### Technical Details

**Files to modify:**
- `src/pages/Login.tsx` -- network error handling, button types, loading states
- `vite.config.ts` -- PWA workbox config for network-first API calls
- `src/components/WeatherWidget.tsx` -- error fallback UI with retry
- `src/index.css` -- mobile-friendly button styles

**No database changes required.**

