# Migration from Supabase (PostgreSQL) to Java Backend with Oracle Database

This project has been successfully migrated from Supabase (PostgreSQL backend) to a Java backend with Oracle Database.

## Changes Made

### Frontend Changes
1. **Removed Supabase dependency** from `package.json`
2. **Created new Java API integration** at `/src/integrations/java-api/`:
   - `client.ts` - Java API client with authentication and data operations
   - `types.ts` - Oracle database types for TypeScript
   - `index.ts` - Module exports

3. **Updated components to use Java API**:
   - [src/pages/Login.tsx](src/pages/Login.tsx) - Now uses `javaApi.auth.signInWithPassword()`
   - [src/pages/WorkerDashboard.tsx](src/pages/WorkerDashboard.tsx) - All Supabase calls replaced with `javaApi.select()`, `insert()`, `update()`
   - [src/contexts/AuthContext.tsx](src/contexts/AuthContext.tsx) - Auth provider updated for Java backend

4. **Created documentation**:
   - [JAVA_BACKEND_SETUP.md](JAVA_BACKEND_SETUP.md) - Comprehensive Java backend setup guide
   - [.env.example](.env.example) - Environment variables for Java API

## Quick Start

### 1. Set up Environment Variables

Create `.env.local` based on `.env.example`:

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
VITE_JAVA_API_URL=http://localhost:8080/api
```

### 2. Install Frontend Dependencies

```bash
npm install
# or
bun install
```

### 3. Start Development Server

```bash
npm run dev
# or
bun run dev
```

The frontend will be available at `http://localhost:5173`

### 4. Set Up Java Backend

You need to create a Java backend that implements the required API endpoints. See [JAVA_BACKEND_SETUP.md](JAVA_BACKEND_SETUP.md) for detailed setup instructions.

## API Endpoints Required

The Java backend must provide these endpoints:

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout

### Data Operations
- `GET /api/data/{tableName}` - Select records
- `POST /api/data/{tableName}` - Insert record
- `PUT /api/data/{tableName}/{id}` - Update record
- `DELETE /api/data/{tableName}/{id}` - Delete record

### Query Parameters
```
?field=value              # equals filter
?field__gte=value         # greater than or equal
?order=field_name         # order by field
?sort=asc|desc            # sort direction
```

## Database Tables

The Oracle database should have the following tables:

- **users** - User credentials and profile
- **farms** - Farm information
- **attendance** - Worker attendance records
- **tasks** - Farm tasks
- **farm_assignments** - User-farm role assignments
- **equipment_requests** - Equipment and supply requests
- **user_roles** - User roles and permissions
- **profiles** - User profiles with additional data

See [JAVA_BACKEND_SETUP.md](JAVA_BACKEND_SETUP.md) for SQL schema examples.

## Java Backend Stack Recommendations

- **Language**: Java 17+
- **Framework**: Spring Boot 3.x
- **Database**: Oracle Database 12c+
- **ORM**: JPA/Hibernate or MyBatis
- **Build**: Maven or Gradle
- **Authentication**: JWT tokens
- **API**: REST with JSON responses

## TypeScript Support

The project includes Oracle database types at `/src/integrations/java-api/types.ts` that define the shape of all database tables for TypeScript support.

## Migration Checklist

- [x] Remove Supabase dependency
- [x] Create Java API client
- [x] Update authentication
- [x] Update data queries
- [x] Update mutations
- [ ] Set up Java backend (manual - see JAVA_BACKEND_SETUP.md)
- [ ] Migrate data from Supabase to Oracle
- [ ] Configure CORS in Java backend
- [ ] Test all API endpoints
- [ ] Deploy to production

## Troubleshooting

### CORS Errors
Make sure your Java backend has CORS configured to allow requests from your frontend URL.

### API Connection Failed
1. Check that the Java backend is running on the configured URL
2. Verify `VITE_JAVA_API_URL` environment variable is correct
3. Check backend logs for errors

### Authentication Issues
1. Verify login endpoint is working: `POST /api/auth/login`
2. Check that tokens are being stored in localStorage
3. Verify JWT token format and expiration

## Support

For more information on setting up the Java backend with Oracle Database, see:
- [JAVA_BACKEND_SETUP.md](JAVA_BACKEND_SETUP.md) - Detailed setup guide
- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [Oracle JDBC Driver](https://www.oracle.com/database/technologies/appdev/jdbc.html)
