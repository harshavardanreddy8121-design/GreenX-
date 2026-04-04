# 🔧 Vercel Build Error Fix - "vite: command not found"

## ❌ **Error:**
```
sh: line 1: vite: command not found
Error: Command "vite build" exited with 127
```

## 🔍 **Root Cause:**
- Vercel is trying to build from repository **root** (`/`)
- Frontend code is in `/frontend` subdirectory
- No `package.json` at root → Vercel can't find dependencies

## ✅ **Solutions (Choose One):**

---

### **Solution 1: Set Root Directory in Vercel Dashboard (EASIEST)**

1. **Go to:** https://vercel.com/dashboard
2. **Open** your GreenX project
3. **Click:** Settings → General
4. **Scroll to:** "Build & Development Settings"
5. **Configure:**

```yaml
Root Directory: frontend
  ↑ IMPORTANT: Set this!

Framework Preset: Vite

Build Command:
  ☑️ Override
  Command: yarn build

Output Directory:  
  ☑️ Override
  Directory: dist

Install Command:
  ☑️ Override  
  Command: yarn install

Node.js Version: 18.x or 20.x
```

6. **Save** changes
7. **Redeploy:** Go to Deployments → Click "..." → Redeploy

---

### **Solution 2: Use vercel.json at Root (Push to GitHub)**

A `vercel.json` file has been created at repository root:

**File:** `/app/vercel.json`
```json
{
  "buildCommand": "cd frontend && yarn build",
  "devCommand": "cd frontend && yarn dev",
  "installCommand": "cd frontend && yarn install",
  "outputDirectory": "frontend/dist",
  "framework": "vite"
}
```

**Steps:**
1. Use **"Save to GitHub"** button to push this file
2. Vercel will automatically use these settings
3. Wait for auto-deployment

---

## 📝 **Complete Vercel Configuration**

### **Recommended Settings:**

| Setting | Value | Notes |
|---------|-------|-------|
| **Root Directory** | `frontend` | Where your package.json lives |
| **Framework** | Vite | Auto-detected |
| **Build Command** | `yarn build` | Runs `vite build` |
| **Output Directory** | `dist` | Vite's default output |
| **Install Command** | `yarn install` | Install dependencies |
| **Node Version** | 18.x or 20.x | Latest LTS |

### **Environment Variables:**

| Variable | Value |
|----------|-------|
| `VITE_API_URL` | `https://spring-boot-backend-production-13e6.up.railway.app/api` |
| `VITE_JAVA_API_URL` | `https://spring-boot-backend-production-13e6.up.railway.app/api` |

---

## 🎯 **What Each Setting Does:**

### **Root Directory: `frontend`**
- Tells Vercel: "My app code is in `/frontend` folder"
- Vercel will `cd frontend` before running commands
- Finds `package.json` in `/frontend/package.json`

### **Build Command: `yarn build`**
- Runs the `build` script from `package.json`
- Which executes: `vite build`
- Vite is installed as a dev dependency, so it works

### **Output Directory: `dist`**
- Vite builds to `/frontend/dist` by default
- Vercel serves files from this directory
- Contains your compiled HTML, CSS, JS

### **Install Command: `yarn install`**
- Installs dependencies from `package.json`
- Includes Vite and all required packages
- Runs BEFORE build command

---

## 🔄 **Deployment Flow:**

```
1. Vercel clones repo from GitHub
   ↓
2. Changes directory to: /frontend
   ↓
3. Runs: yarn install
   ↓ (installs vite, react, all deps)
4. Runs: yarn build
   ↓ (vite build → creates /dist)
5. Deploys: /frontend/dist
   ↓
6. Your app is live! ✅
```

---

## 🧪 **Test Locally First (Optional):**

```bash
cd /app/frontend
yarn install
yarn build

# Should complete without errors
# Output: dist/ folder created
```

---

## ⚠️ **Common Mistakes to Avoid:**

❌ **DON'T set Build Command to:** `vite build`
✅ **DO set Build Command to:** `yarn build`

❌ **DON'T leave Root Directory empty** (if code is in subdirectory)
✅ **DO set Root Directory to:** `frontend`

❌ **DON'T use:** `npm` (your project uses yarn)
✅ **DO use:** `yarn`

---

## 🎯 **Quick Fix Checklist:**

- [ ] Set Root Directory to `frontend` in Vercel
- [ ] Set Build Command to `yarn build`
- [ ] Set Output Directory to `dist`
- [ ] Set Install Command to `yarn install`
- [ ] Add environment variable `VITE_API_URL`
- [ ] Click "Redeploy" in Vercel
- [ ] Wait for build (should succeed in ~2-3 mins)
- [ ] Visit deployed URL and test login

---

## 📊 **Expected Build Output:**

```
✓ Installing dependencies (yarn install)
  ✓ 1234 packages installed

✓ Building application (yarn build)
  ✓ vite v5.4.21 building for production...
  ✓ 145 modules transformed
  ✓ dist/index.html                  1.23 kB
  ✓ dist/assets/index-abc123.js      234.56 kB
  ✓ dist/assets/index-def456.css     23.45 kB
  ✓ built in 45.67s

✓ Deployment ready
```

---

## 🆘 **Still Not Working?**

### **Error: "Cannot find module"**
- Check `package.json` has all dependencies
- Try: Delete `node_modules` and `yarn.lock`, then reinstall

### **Error: "Out of memory"**
- Reduce bundle size
- Check for large dependencies
- Enable source map: `build.sourcemap = false` in vite.config.ts

### **Error: "Build timeout"**
- Optimize dependencies
- Remove unused imports
- Check for infinite loops in build

---

## 📞 **Quick Reference:**

**Vercel Dashboard:** https://vercel.com/dashboard
**Railway Backend:** https://spring-boot-backend-production-13e6.up.railway.app/api
**Build Command:** `yarn build`
**Root Directory:** `frontend`

---

**Your build will succeed once Root Directory is set to `frontend`!** 🚀
