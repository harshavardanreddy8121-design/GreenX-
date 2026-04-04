# ✅ Vercel Deployment & Login Test Guide

## 🎯 **After Vercel Finishes Deploying:**

### **Step 1: Visit Your Vercel URL**
- Go to your Vercel app URL
- Hard refresh the page: **Ctrl + Shift + R** (Windows) or **Cmd + Shift + R** (Mac)
- This clears any cached version

### **Step 2: Open Browser DevTools**
- Press **F12** (or right-click → Inspect)
- Go to **"Console"** tab
- Check for any red errors
- You should NOT see any errors about API URL

### **Step 3: Test Login**
**Credentials:**
- Email: `harsha@gmail.com`
- Password: `harsha123`

**Click "Sign In"**

### **Step 4: Check Network Tab (if login fails)**
- Press **F12** → **"Network"** tab
- Click "Sign In" again
- Look for a request to `/auth/login`
- Click on it to see details:

**What to check:**
```
Request URL: https://spring-boot-backend-production-13e6.up.railway.app/api/auth/login
Status Code: 200 OK  ✅ (success)
```

**If Status is 200:** Login should work! ✅
**If Status is 403:** Railway backend needs to be redeployed with fixes
**If Status is 404:** URL is wrong
**If Status is CORS error:** Backend CORS needs fixing

---

## ✅ **Expected Success Flow:**

1. You enter email and password
2. Click "Sign In"
3. Loading spinner appears briefly
4. You're redirected to the dashboard
5. You see your name/role (Admin)

---

## ❌ **If Login Still Doesn't Work:**

### **Check Console for:**
```javascript
// Paste this in Console to verify API URL
console.log('API URL:', import.meta.env.VITE_API_URL);
// Should print: https://spring-boot-backend-production-13e6.up.railway.app/api
```

### **Manual Test:**
```javascript
// Test Railway connection directly
fetch('https://spring-boot-backend-production-13e6.up.railway.app/api/auth/login', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({email: 'harsha@gmail.com', password: 'harsha123'})
})
.then(r => r.json())
.then(d => {
  if(d.success) {
    console.log('✅ Backend is working!', d.data.user);
  } else {
    console.log('❌ Login failed:', d);
  }
})
.catch(e => console.error('❌ Connection error:', e));
```

---

## 🎯 **Troubleshooting:**

| Issue | Solution |
|-------|----------|
| API URL is undefined | Redeploy Vercel again |
| ERR_NAME_NOT_RESOLVED | Check Railway backend is online |
| Status 403 | Railway needs login bug fix deployed |
| Status 404 | Check URL ends with `/api` |
| CORS error | Railway ALLOWED_ORIGINS should be `*` |
| Nothing happens on click | Check browser console for errors |

---

## 📞 **Test Credentials:**
- **Admin 1**: harsha@gmail.com / harsha123
- **Admin 2**: admin@farmapp.com / admin123

---

**Once Vercel deployment finishes, try logging in and let me know what happens!** 🚀
