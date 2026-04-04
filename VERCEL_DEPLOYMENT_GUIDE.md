# 🚀 Vercel Deployment Guide - GreenX Frontend

## ✅ **Updated Configuration**

### **Backend URL Changed:**
- ❌ **Old**: Render backend URL
- ✅ **New**: Railway backend URL

**New Railway Backend:**
```
https://spring-boot-backend-production-13e6.up.railway.app/api
```

---

## 📝 **Step-by-Step: Update Vercel**

### **Method 1: Update Environment Variables in Vercel Dashboard (RECOMMENDED)**

#### **Step 1: Access Vercel Dashboard**
1. Go to https://vercel.com/dashboard
2. Click on your **GreenX project**
3. Click **"Settings"** tab
4. Click **"Environment Variables"** in sidebar

#### **Step 2: Update API URL Variables**

**Find and update these variables:**

| Variable Name | New Value | Apply To |
|--------------|-----------|----------|
| `VITE_API_URL` | `https://spring-boot-backend-production-13e6.up.railway.app/api` | Production, Preview, Development |
| `VITE_JAVA_API_URL` | `https://spring-boot-backend-production-13e6.up.railway.app/api` | Production, Preview, Development |

**How to update:**
1. Click **"Edit"** on each variable
2. Replace the old Render URL with Railway URL
3. Make sure all environments are checked (Production, Preview, Development)
4. Click **"Save"**

#### **Step 3: Redeploy**
1. Go to **"Deployments"** tab
2. Click **"..."** menu on latest deployment
3. Click **"Redeploy"**
4. Wait for build to complete

---

### **Method 2: Push Updated Code to GitHub (Alternative)**

The code has been updated with:
- ✅ `.env.production` file with Railway backend URL
- ✅ `vercel.json` updated to use `yarn` instead of `npm`
- ✅ Vite output directory set to `dist`

**Steps:**
1. Use **"Save to GitHub"** button in Emergent
2. Vercel will automatically detect the push
3. Vercel will redeploy with new configuration
4. Wait for deployment to complete

---

## 🔧 **Vercel Project Settings**

### **Framework Preset:**
```
Framework: Vite
```

### **Build & Development Settings:**
```
Build Command: yarn build
Output Directory: dist
Install Command: yarn install
Development Command: yarn dev
```

### **Root Directory:**
```
Root Directory: frontend
```
(Or leave empty if deploying from frontend folder directly)

### **Node.js Version:**
```
Node.js Version: 18.x or 20.x
```

---

## 🐛 **Troubleshooting Build Failures**

### **Issue 1: "Module not found"**
**Solution:** Ensure all dependencies are in `package.json`
```bash
# Locally test build
cd /app/frontend
yarn install
yarn build
```

### **Issue 2: "Build timeout"**
**Solution:** 
- Check if build command is correct: `yarn build`
- Verify output directory: `dist`
- Check for large dependencies

### **Issue 3: "Environment variable not found"**
**Solution:**
- Verify `VITE_API_URL` is set in Vercel Environment Variables
- Make sure it's applied to all environments
- Redeploy after adding variables

### **Issue 4: "Type errors during build"**
**Solution:**
```json
// In tsconfig.json, ensure:
{
  "compilerOptions": {
    "skipLibCheck": true
  }
}
```

### **Issue 5: "API calls fail after deployment"**
**Solution:**
- Verify Railway backend is deployed and running
- Check CORS is enabled on backend (`ALLOWED_ORIGINS=*`)
- Test Railway backend directly:
```bash
curl https://spring-boot-backend-production-13e6.up.railway.app/api/auth/login
```

---

## ✅ **Deployment Checklist**

Before deploying to Vercel:

- [ ] Railway backend is deployed and working
- [ ] Railway backend URL copied correctly
- [ ] Vercel environment variables updated
- [ ] `vercel.json` configured correctly (yarn, dist)
- [ ] `.env.production` file created with Railway URL
- [ ] Code pushed to GitHub
- [ ] Vercel redeployment triggered

After deployment:

- [ ] Build succeeds (no errors)
- [ ] Deployment shows "Ready" status
- [ ] Visit Vercel URL and test login
- [ ] API calls connect to Railway backend
- [ ] No CORS errors in browser console

---

## 🧪 **Test After Deployment**

### **1. Visit Your Vercel URL**
```
https://your-app.vercel.app
```

### **2. Open Browser DevTools**
- Press F12
- Go to "Network" tab
- Try to login

### **3. Verify API Calls**
Check that API calls go to Railway:
```
Request URL: https://spring-boot-backend-production-13e6.up.railway.app/api/auth/login
Status: 200 OK
Response: {"success":true,"data":{...}}
```

### **4. Test Login**
- Email: `harsha@gmail.com`
- Password: `harsha123`
- Should successfully login and show dashboard

---

## 📊 **Your Deployment Architecture**

```
┌─────────────────────────────────────────────┐
│              Vercel (Frontend)              │
│  https://your-app.vercel.app                │
│  ┌───────────────────────────────────────┐  │
│  │   React + Vite Frontend               │  │
│  │   Environment: VITE_API_URL           │  │
│  └───────────────┬───────────────────────┘  │
└──────────────────┼──────────────────────────┘
                   │
                   │ HTTPS API Calls
                   │
                   ▼
┌─────────────────────────────────────────────┐
│           Railway (Backend)                 │
│  spring-boot-backend-production-13e6...     │
│  ┌───────────────────────────────────────┐  │
│  │   Java Spring Boot API                │  │
│  │   Port: 8001, Context: /api           │  │
│  └──────────────┬────────────────────────┘  │
│                 │                            │
│  ┌──────────────▼────────────────────────┐  │
│  │   PostgreSQL Database                 │  │
│  └───────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

---

## 🔐 **Security Notes**

- ✅ HTTPS enabled on both Vercel and Railway
- ✅ CORS configured on backend
- ✅ JWT authentication working
- ✅ Environment variables secured in Vercel

---

## 💡 **Pro Tips**

1. **Preview Deployments**: Every GitHub branch gets a preview URL on Vercel
2. **Auto Deploy**: Push to `main` branch auto-deploys to production
3. **Rollback**: Click "Promote to Production" on previous deployment to rollback
4. **Domains**: Add custom domain in Vercel Settings → Domains
5. **Analytics**: Enable Vercel Analytics for performance insights

---

## 🆘 **Still Getting Errors?**

Share the error message and I'll help debug:
- Build errors: Check Vercel deployment logs
- Runtime errors: Check browser console
- API errors: Check Railway backend logs
- CORS errors: Verify backend CORS settings

---

## 📞 **Quick Reference**

**Railway Backend:** https://spring-boot-backend-production-13e6.up.railway.app/api
**Vercel Dashboard:** https://vercel.com/dashboard
**Test Credentials:** harsha@gmail.com / harsha123

---

**Your frontend will be fully operational once Vercel is updated with the Railway backend URL!** 🎉
