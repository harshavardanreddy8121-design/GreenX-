# 🔧 Frontend API Configuration - FIXED

## ✅ **Changes Made:**

### **1. Updated `/frontend/src/lib/backend.ts`**
- Added validation for `VITE_API_URL`
- Shows clear error if environment variable is missing
- Logs API URL in development mode

### **2. Updated `/frontend/src/lib/api.ts`**
- Added validation before making requests
- Detects if HTML is returned instead of JSON
- Shows helpful error messages with fix instructions
- Logs all API requests in development mode

### **3. Created `/frontend/src/lib/apiConfig.ts`**
- Validates API configuration on app load
- Shows user-friendly error banner if misconfigured
- Provides clear instructions to fix

### **4. Updated `/frontend/src/App.tsx`**
- Imports apiConfig to validate on startup

### **5. Updated `/frontend/.env.production`**
- Set Railway backend URL
- Added deployment instructions

---

## 🚀 **How API Calls Work Now:**

### **Before (Broken):**
```javascript
// VITE_API_URL not set or empty
fetch('/api/auth/login')  // Goes to https://mygreenx.vercel.app/api/auth/login
// Returns HTML (404 from Vercel)
```

### **After (Fixed):**
```javascript
// VITE_API_URL = https://spring-boot-backend-production-13e6.up.railway.app/api
fetch('https://spring-boot-backend-production-13e6.up.railway.app/api/auth/login')
// Returns JSON from Railway backend ✅
```

---

## 📋 **Deployment Checklist:**

### **Step 1: Push Code to GitHub**
```bash
# Use "Save to GitHub" button in Emergent
# Or manually:
git add .
git commit -m "fix: Configure API calls to use Railway backend"
git push origin main
```

### **Step 2: Set Vercel Environment Variable**

**CRITICAL:** This MUST be set in Vercel for the code to work!

1. Go to **Vercel Dashboard** → Your Project
2. **Settings** → **Environment Variables**
3. Click **"Add New"** or **Edit existing `VITE_API_URL`**
4. Set:
   ```
   Name: VITE_API_URL
   Value: https://spring-boot-backend-production-13e6.up.railway.app/api
   ```
5. **Check ALL environments:**
   - ✅ **Production** ← CRITICAL!
   - ✅ Preview
   - ✅ Development
6. Click **"Save"**

### **Step 3: Redeploy Vercel**

1. Go to **"Deployments"** tab
2. Find **Production** deployment
3. Click **"..."** → **"Redeploy"**
4. Wait 2-3 minutes

### **Step 4: Verify**

1. Visit: `https://mygreenx.vercel.app`
2. Open DevTools (F12) → Console
3. You should see:
   ```
   ✅ API Configuration Valid
   Backend URL: https://spring-boot-backend-production-13e6.up.railway.app/api
   ```
4. Login with: `harsha@gmail.com` / `harsha123`
5. Should work! ✅

---

## 🔍 **Debugging:**

### **If you see this error:**
```
❌ CRITICAL ERROR: VITE_API_URL is not set!
```

**Fix:**
1. Check Vercel Environment Variables
2. Make sure `VITE_API_URL` is set for **Production**
3. Redeploy

### **If you see this error:**
```
API configuration error: receiving HTML instead of JSON
```

**This means:**
- API calls are hitting Vercel (returns HTML)
- Instead of Railway backend (returns JSON)

**Fix:**
1. Verify `VITE_API_URL` is an **absolute URL** (starts with https://)
2. Should be: `https://spring-boot-backend-production-13e6.up.railway.app/api`
3. NOT: `/api` or `api` (relative URLs)
4. Redeploy after fixing

### **Check API Configuration:**

In browser console (on your Vercel site):
```javascript
// Should show the Railway backend URL
console.log(import.meta.env.VITE_API_URL);

// Should be: https://spring-boot-backend-production-13e6.up.railway.app/api
```

---

## 🎯 **How Each File Works:**

### **backend.ts**
```typescript
// Gets VITE_API_URL from environment
const envUrl = import.meta.env.VITE_API_URL;

// Shows error if not set
if (!envUrl) {
  console.error('VITE_API_URL is not set!');
}

// Exports the base URL
export const API_BASE_URL = envUrl;
```

### **api.ts**
```typescript
import { API_BASE_URL } from './backend';
const BASE = API_BASE_URL;

// All requests use full URL
fetch(`${BASE}/auth/login`)
// = https://spring-boot-backend-production-13e6.up.railway.app/api/auth/login ✅
```

### **apiConfig.ts**
```typescript
// Runs on app startup
// Validates VITE_API_URL is set correctly
// Shows error banner if missing
```

---

## ✅ **Expected Behavior:**

### **Development (Local):**
- `VITE_API_URL` from `.env` or `.env.development`
- Console logs show API URL
- Detailed error messages

### **Production (Vercel):**
- `VITE_API_URL` from Vercel Environment Variables
- API calls go to Railway backend
- Login works
- Authentication persists

---

## 🆘 **Common Issues:**

### **Issue 1: "VITE_API_URL is not set"**
**Solution:** Set in Vercel Environment Variables for Production

### **Issue 2: "Receiving HTML instead of JSON"**
**Solution:** URL is relative, needs to be absolute (https://...)

### **Issue 3: "Login works but redirects back"**
**Solution:** Check `/auth/me` endpoint - verify it returns 200 OK

### **Issue 4: "CORS error"**
**Solution:** Verify Railway has `ALLOWED_ORIGINS=*`

---

## 📊 **Request Flow:**

```
User clicks "Login"
    ↓
Frontend: api.auth.login(email, password)
    ↓
api.ts: fetch(`${BASE}/auth/login`)
    ↓
BASE = https://spring-boot-backend-production-13e6.up.railway.app/api
    ↓
Full URL: https://spring-boot-backend-production-13e6.up.railway.app/api/auth/login
    ↓
Request goes to Railway backend
    ↓
Railway returns: { success: true, data: { token: "...", user: {...} } }
    ↓
Frontend saves token to localStorage
    ↓
Frontend redirects to dashboard
    ✅ SUCCESS!
```

---

## 🎉 **After Deployment:**

Your app will:
- ✅ Make all API calls to Railway backend
- ✅ Receive JSON responses (not HTML)
- ✅ Show helpful errors if misconfigured
- ✅ Work on both Production and Preview deployments
- ✅ Persist authentication properly

---

**Push to GitHub, set VITE_API_URL in Vercel, and redeploy!** 🚀
