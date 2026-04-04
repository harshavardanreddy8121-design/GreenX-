# 🚂 Railway Deployment Guide - GreenX Backend

## ✅ **Current Status**

### **Working Railway Services:**
- **Spring Boot Backend**: https://spring-boot-backend-production-13e6.up.railway.app
- **PostgreSQL Database**: Connected and operational
- **Region**: Asia Southeast (Singapore)

### **Issue Identified:**
- Backend returning 403 Forbidden on login
- Railway has OLD code (before login bug fix)
- Need to redeploy with latest fixed code

---

## 🔧 **Fixes Applied to `/java-backend`**

### 1. **Login Bug Fix** ✅
```java
// File: src/main/java/com/greenx/farmapi/controller/AuthController.java
// Changed from:
@RequestMapping("/api/auth")  ❌

// Changed to:
@RequestMapping("/auth")  ✅
```

### 2. **Port Configuration** ✅
```yaml
# File: src/main/resources/application.yml
server.port: ${PORT:8001}  # Changed from 8080
```

### 3. **Security Configuration** ✅
```java
// File: src/main/java/com/greenx/farmapi/security/SecurityConfig.java
.requestMatchers("/auth/**", "/health").permitAll()
```

### 4. **Java Version** ✅
```xml
<!-- File: pom.xml -->
<java.version>17</java.version>  <!-- Changed from 21 -->
```

---

## 🚀 **How to Deploy to Railway**

### **Step 1: Push Latest Code to GitHub**

1. Use the "Save to GitHub" button in Emergent
2. Or commit manually:
```bash
git add java-backend/
git commit -m "fix: Resolved login bug - corrected AuthController mapping"
git push origin main
```

### **Step 2: Trigger Railway Redeploy**

1. Go to Railway Dashboard: https://railway.com/project/2c5cdc54-0bcc-4413-ac04-2b8f9091cd22
2. Click on **"Spring Boot Backend"** service
3. Go to **"Deployments"** tab
4. Click **"Redeploy"** button
5. Railway will automatically:
   - Pull latest code from GitHub
   - Run `mvn clean package -DskipTests`
   - Build new JAR with fixes
   - Deploy to production
   - Restart service

### **Step 3: Wait for Deployment**

- Build time: ~5-10 minutes (Maven downloads dependencies)
- Watch "Logs" tab for progress
- Look for: `BUILD SUCCESS` and `Started FarmManagementApiApplication`

---

## 🧪 **Test After Deployment**

```bash
# Test login endpoint
curl -X POST https://spring-boot-backend-production-13e6.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"harsha@gmail.com","password":"harsha123"}'

# Expected Response (200 OK):
{
  "success": true,
  "data": {
    "token": "eyJhbGc...",
    "user": {
      "id": "...",
      "email": "harsha@gmail.com",
      "name": "Harsha",
      "role": "ADMIN"
    }
  }
}
```

---

## 📊 **Railway Environment Variables**

Your backend is already configured with:

```env
# Database (Auto-injected from Postgres service)
SPRING_DATASOURCE_URL = ${{Postgres.DATABASE_URL}}
SPRING_DATASOURCE_USERNAME = ${{Postgres.PGUSER}}
SPRING_DATASOURCE_PASSWORD = ${{Postgres.PGPASSWORD}}
PGHOST = ${{Postgres.PGHOST}}
PGPORT = ${{Postgres.PGPORT}}
PGDATABASE = ${{Postgres.PGDATABASE}}

# Application
PORT = (Railway auto-assigns)
JWT_SECRET = (your secret)
ALLOWED_ORIGINS = *
```

---

## 🗑️ **Clean Up Duplicate Services**

Remove these offline services from your Railway project:

1. **GreenX Backend** (duplicate, offline)
2. **GreenX-** (41 warnings, offline)
3. **luminous-reverence** (critical issues, offline)
4. **invigorating-serenity** (critical issues, offline)

**Keep only:**
- ✅ Spring Boot Backend
- ✅ Postgres

**How to remove:**
1. Click on each service
2. Settings → Danger Zone → Remove Service
3. Confirm deletion

---

## 🌐 **Update Frontend to Use Railway Backend**

### **Local Frontend:**
Update `/app/frontend/.env`:
```env
VITE_API_URL=https://spring-boot-backend-production-13e6.up.railway.app/api
```

### **Deployed Frontend (Vercel/Netlify):**
Add environment variable:
```env
VITE_API_URL=https://spring-boot-backend-production-13e6.up.railway.app/api
```

---

## ✅ **Deployment Checklist**

- [ ] Latest code pushed to GitHub (with java-backend fixes)
- [ ] Railway redeployment triggered
- [ ] Build completes successfully (check logs)
- [ ] Login endpoint returns 200 OK
- [ ] Admin users auto-created (check logs)
- [ ] Frontend updated with Railway backend URL
- [ ] Duplicate services removed
- [ ] Full login flow tested

---

## 🎯 **Final Architecture**

```
┌─────────────────────────────────────────┐
│         Railway Production              │
├─────────────────────────────────────────┤
│                                         │
│  ┌──────────────────────────────────┐  │
│  │   Spring Boot Backend            │  │
│  │   Port: 8001                     │  │
│  │   URL: spring-boot-backend-...   │  │
│  └────────────┬─────────────────────┘  │
│               │                         │
│               │ Connected via           │
│               │ ${{Postgres.*}}         │
│               ▼                         │
│  ┌──────────────────────────────────┐  │
│  │   PostgreSQL Database            │  │
│  │   Storage: 500MB                 │  │
│  │   Region: US West                │  │
│  └──────────────────────────────────┘  │
│                                         │
└─────────────────────────────────────────┘
           │
           │ HTTPS
           │
           ▼
    Frontend (Vercel/Local)
```

---

## 📝 **Test Credentials**

- **Admin 1**: harsha@gmail.com / harsha123
- **Admin 2**: admin@farmapp.com / admin123

---

## 🆘 **Troubleshooting**

### **Still Getting 403 After Redeploy:**
1. Clear Railway cache: Settings → Redeploy without cache
2. Check logs for "AuthController" mapping
3. Verify source branch is `main`
4. Ensure `/java-backend` directory is correct

### **Build Fails:**
1. Check Maven errors in logs
2. Verify Java 17 is available
3. Ensure pom.xml is valid
4. Try: Settings → Delete deployment → Redeploy

### **Database Connection Errors:**
1. Verify Postgres service is Online
2. Check environment variable references
3. Look for connection errors in logs

---

**Your backend will be fully operational once redeployed with the fixed code!** 🚀
