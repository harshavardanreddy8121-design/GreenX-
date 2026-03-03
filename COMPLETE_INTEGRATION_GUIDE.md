# Farm Management System - Complete Integration Guide

> **Status**: ✅ Fully integrated Java backend with Oracle database

This document provides a complete overview of the integrated system with both frontend and backend components.

## 📋 Table of Contents

1. [Architecture](#architecture)
2. [Quick Start](#quick-start)
3. [Directory Structure](#directory-structure)
4. [Frontend Setup](#frontend-setup)
5. [Backend Setup](#backend-setup)
6. [Database Setup](#database-setup)
7. [API Communication](#api-communication)
8. [Testing](#testing)
9. [Deployment](#deployment)
10. [Troubleshooting](#troubleshooting)

## 🏗️ Architecture

The system uses a three-tier architecture:

```
┌─────────────────────────────────┐
│     React Frontend (Vite)        │  Port: 5173
│  - User dashboards               │
│  - Real-time updates             │
│  - Form handling                 │
└────────────┬──────────────────────┘
             │ HTTP/REST (CORS enabled)
             │
┌────────────▼──────────────────────┐
│     Java Spring Boot Backend       │  Port: 8080
│  - REST API endpoints              │
│  - Authentication (JWT)            │
│  - Business logic                  │
│  - Data validation                 │
└────────────┬──────────────────────┘
             │ JDBC/SQL
             │
┌────────────▼──────────────────────┐
│    Oracle Database (ORCL)          │  Port: 1521
│  - Business data                   │
│  - User information                │
│  - Farm data                       │
│  - Analytics data                  │
└────────────────────────────────────┘
```

## 🚀 Quick Start

### Frontend (5 minutes)

```bash
cd web-hug-studio-46-043df96f-70335c46-main

# Copy environment template
cp .env.example .env.local

# Install dependencies
npm install
# or
bun install

# Start development server
npm run dev
# Runs on http://localhost:5173
```

### Backend (10 minutes)

```bash
cd java-backend

# Build the project
mvn clean package

# Run the backend
java -jar target/farm-management-api-1.0.0.jar
# Runs on http://localhost:8080/api
```

### Database (5 minutes)

```bash
# Connect to Oracle
sqlplus sys as sysdba

# Create user (run the setup)
CREATE USER oracle_user IDENTIFIED BY oracle_password;
GRANT CREATE SESSION, CREATE TABLE, UNLIMITED TABLESPACE TO oracle_user;

# Execute migration script
@java-backend/src/main/resources/db/migration/V1__init_schema.sql
```

## 📁 Directory Structure

```
web-hug-studio-46-043df96f-70335c46-main/
├── src/                               # Frontend source code
│   ├── components/                    # React components
│   │   └── GreenXLogo.tsx
│   ├── pages/                         # Page components
│   │   ├── Login.tsx                 # ✅ Uses javaApi
│   │   ├── WorkerDashboard.tsx       # ✅ Uses javaApi
│   │   ├── LandownerDashboard.tsx    # ✅ Uses javaApi
│   │   ├── FieldManagerDashboard.tsx # ✅ Uses javaApi
│   │   ├── ExpertDashboard.tsx       # ✅ Uses javaApi
│   │   └── admin/                     # ✅ All use javaApi
│   ├── integrations/
│   │   ├── java-api/                 # ✅ Java API client
│   │   │   ├── client.ts             # API communication layer
│   │   │   ├── types.ts              # Oracle DB types
│   │   │   └── index.ts
│   │   ├── lovable/                  # OAuth integration
│   │   └── supabase/                 # (Deprecated)
│   ├── contexts/
│   │   └── AuthContext.tsx           # ✅ JWT-based auth
│   ├── hooks/
│   │   └── useUserRole.ts            # ✅ Uses javaApi
│   └── utils/
│       └── ApiConnectionTester.tsx   # ✅ Connection test utility
├── java-backend/                      # ✅ NEW Java Spring Boot backend
│   ├── src/main/java/com/greenx/farmapi/
│   │   ├── FarmManagementApiApplication.java    # Entry point
│   │   ├── controller/
│   │   │   ├── AuthController.java              # Login/auth endpoints
│   │   │   └── DataController.java              # Generic CRUD endpoints
│   │   ├── service/
│   │   │   ├── DataService.java                 # Data operation interface
│   │   │   └── impl/DataServiceImpl.java         # JDBC implementation
│   │   ├── model/User.java                      # JPA entity
│   │   ├── repository/UserRepository.java       # Spring Data JPA
│   │   ├── dto/                                 # Data transfer objects
│   │   ├── util/
│   │   │   ├── JwtUtil.java                     # JWT token handling
│   │   │   └── HealthCheckController.java       # Health check endpoint
│   │   └── config/                              # CORS, Security config
│   ├── src/main/resources/
│   │   ├── application.yml                      # ✅ Oracle DB config
│   │   └── db/migration/V1__init_schema.sql     # ✅ DB schema
│   └── pom.xml                                  # Maven dependencies
├── .env.example                       # ✅ Environment template
├── MIGRATION_GUIDE.md                 # Migration documentation
├── MIGRATION_SUMMARY.md               # Summary of changes
├── JAVA_BACKEND_SETUP.md             # Backend setup guide
├── JAVA_BACKEND_DEPLOYMENT.md        # ✅ Deployment guide
└── README.md                          # Original project README
```

## 🎨 Frontend Setup

### Configuration

Edit `.env.local`:
```env
VITE_JAVA_API_URL=http://localhost:8080/api
```

### Development Server

```bash
npm run dev
```

Access at: `http://localhost:5173`

### Building for Production

```bash
npm run build
```

Output: `dist/` directory

## 🔧 Backend Setup

### Prerequisites
- Java 17+
- Maven 3.8+
- Oracle Database

### Installation

1. **Build the project**
   ```bash
   mvn clean package
   ```

2. **Configure database** (in `application.yml`)
   ```yaml
   datasource:
     url: jdbc:oracle:thin:@localhost:1521:ORCL
     username: oracle_user
     password: oracle_password
   ```

3. **Initialize database**
   ```bash
   sqlplus oracle_user/oracle_password@ORCL @migration_script.sql
   ```

4. **Run the backend**
   ```bash
   java -jar target/farm-management-api-1.0.0.jar
   ```

   Or with Maven:
   ```bash
   mvn spring-boot:run
   ```

Access API at: `http://localhost:8080/api`

## 🗄️ Database Setup

### Oracle Database

The database includes these main tables:

| Table | Purpose |
|-------|---------|
| `USERS` | User accounts and authentication |
| `PROFILES` | Extended user information |
| `USER_ROLES` | User role assignments |
| `FARMS` | Farm information |
| `FARM_ASSIGNMENTS` | User-farm relationships |
| `TASKS` | Work tasks and assignments |
| `ATTENDANCE` | Worker check-in/out records |
| `EQUIPMENT_REQUESTS` | Equipment and supply requests |
| `DIAGNOSTICS` | Expert crop diagnostics |
| `WEATHER` | Weather data by location |

See [JAVA_BACKEND_DEPLOYMENT.md](JAVA_BACKEND_DEPLOYMENT.md) for detailed setup instructions.

## 📡 API Communication

### Frontend to Backend Flow

1. **Authentication**
   ```typescript
   // Frontend
   const response = await javaApi.auth.signInWithPassword(email, password);
   // ↓ HTTP POST /auth/login
   // ← Returns JWT token
   localStorage.setItem('javaApiToken', response.data.token);
   ```

2. **Data Operations**
   ```typescript
   // Frontend
   const response = await javaApi.select('farms', { eq: { owner_id: userId } });
   // ↓ HTTP GET /data/farms?owner_id=USER_ID
   // ← Returns array of farms
   ```

3. **Authorization**
   ```typescript
   // All API calls include JWT token in headers
   Authorization: Bearer <token>
   ```

### Request/Response Format

**All responses follow this format:**
```json
{
  "success": boolean,
  "data": any,
  "error": string | null,
  "message": string | null
}
```

**Example responses:**
```json
// Success
{
  "success": true,
  "data": { "token": "jwt_token", "user": {...} }
}

// Error
{
  "success": false,
  "error": "Invalid credentials"
}
```

## 🧪 Testing

### Test Connection

1. **Use the included connection tester**
   ```typescript
   import { ApiConnectionTester } from '@/utils/ApiConnectionTester';
   
   <ApiConnectionTester />
   ```

2. **Or test manually**
   ```bash
   # Check backend health
   curl http://localhost:8080/api/health
   
   # Test login
   curl -X POST http://localhost:8080/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@farmapp.com","password":"admin123"}'
   ```

3. **Monitor frontend-backend communication**
   - Open browser DevTools (F12)
   - Go to Network tab
   - Look for requests to `http://localhost:8080/api`
   - Check response status and data

## 🚢 Deployment

### Frontend Deployment

**Build for production:**
```bash
npm run build
```

Deploy the `dist/` folder to:
- Vercel, Netlify, AWS S3, GitHub Pages, etc.

Update `.env.local` with production API URL:
```env
VITE_JAVA_API_URL=https://api.yourdomain.com/api
```

### Backend Deployment

See [JAVA_BACKEND_DEPLOYMENT.md](JAVA_BACKEND_DEPLOYMENT.md) for:
- Docker deployment
- Systemd service setup
- Production environment variables
- Database migration
- SSL/HTTPS configuration

## 🔍 Troubleshooting

### Frontend Issues

**Problem: 403 CORS error**
```
Access to XMLHttpRequest at 'http://localhost:8080/api/...' blocked by CORS policy
```

**Solution:**
- Verify CORS is enabled in `FarmManagementApiApplication.java`
- Check backend is running
- Verify `VITE_JAVA_API_URL` in `.env.local`

**Problem: Backend returns 401 Unauthorized**

**Solution:**
- Verify JWT token is being sent
- Check if token has expired
- Ensure `Authorization: Bearer <token>` header is present

### Backend Issues

**Problem: Database connection failed**
```
Unable to acquire a Connection from the DataSource
```

**Solution:**
- Verify Oracle database is running
- Check connection string in `application.yml`
- Test with SQLPlus: `sqlplus oracle_user/oracle_password@ORCL`

**Problem: Table not found**
```
java.sql.SQLSyntaxErrorException: ORA-00942: table or view does not exist
```

**Solution:**
- Run migration script: `V1__init_schema.sql`
- Verify tables in Oracle: `SELECT * FROM user_tables;`

### Database Issues

**Problem: Cannot connect to Oracle**

**Solution:**
```bash
# Test connection
sqlplus oracle_user/oracle_password@ORCL

# Check Oracle listener status
lsnrctl status

# Start listener if needed
lsnrctl start
```

## 📞 Support

For more information, see:
- [JAVA_BACKEND_SETUP.md](JAVA_BACKEND_SETUP.md)
- [JAVA_BACKEND_DEPLOYMENT.md](JAVA_BACKEND_DEPLOYMENT.md)
- [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md)
- Original [README.md](README.md)

## 🎯 Summary

✅ **Frontend** - React + Vite, connected to Java backend via REST API
✅ **Backend** - Spring Boot 3.x with JWT authentication
✅ **Database** - Oracle with complete schema and migration scripts
✅ **API** - Generic CRUD endpoints with role-based access
✅ **Deployment** - Ready for production deployment

The system is now fully integrated and ready for:
- Development testing
- Production deployment
- Data migration from Supabase
- User acceptance testing
