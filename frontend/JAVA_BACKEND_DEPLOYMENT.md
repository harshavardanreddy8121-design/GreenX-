# Java Backend Setup & Deployment Guide

## Prerequisites

- Java 21 LTS or higher
- Maven 3.8+
- Oracle Database 12c or higher
- Git

### Install Java 21

**Windows:**
```bash
choco install openjdk21
# or download from: https://jdk.java.net/21/
```

**macOS:**
```bash
brew install openjdk@21
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get update
sudo apt-get install openjdk-21-jdk
```

Verify installation:
```bash
java -version
# Should show: openjdk version "21.x.x" or similar
```

### Install Maven

**Windows:**
```bash
choco install maven
```

**macOS:**
```bash
brew install maven
```

**Linux:**
```bash
sudo apt-get install maven
```

Verify installation:
```bash
mvn --version
```

## Oracle Database Setup

### Create Oracle User

```sql
-- Connect as SYS or SYSTEM
sqlplus sys as sysdba

-- Create tablespace (optional but recommended)
CREATE TABLESPACE farm_app_ts DATAFILE 'farm_app.dbf' SIZE 100M;

-- Create user
CREATE USER oracle_user IDENTIFIED BY oracle_password
DEFAULT TABLESPACE farm_app_ts
QUOTA UNLIMITED ON farm_app_ts;

-- Grant privileges
GRANT CREATE SESSION TO oracle_user;
GRANT CREATE TABLE TO oracle_user;
GRANT CREATE INDEXES TO oracle_user;
GRANT CREATE SEQUENCE TO oracle_user;
GRANT UNLIMITED TABLESPACE TO oracle_user;

COMMIT;
```

### Run Migration Script

```bash
# Navigate to the migration script
cd java-backend/src/main/resources/db/migration

# Execute with SQLPlus
sqlplus oracle_user/oracle_password@ORCL @V1__init_schema.sql

# Or use SQL Developer to execute the script
```

## Prepare Frontend (install dependencies)

Before you start the frontend or run the setup script, make sure the Node
packages are installed. If you see TypeScript errors like "Cannot find module
'react'" or missing `import.meta.env`, run:

```bash
npm install   # or bun install
yarn install
```

These commands populate `node_modules` and install type declarations; the
errors will disappear once the dependencies are present.

## Build and Run Java Backend

### Clone/Copy Project

```bash
cd java-backend
```

### Update Configuration

Edit `src/main/resources/application.yml`:

```yaml
spring:
  datasource:
    url: jdbc:oracle:thin:@localhost:1521:ORCL  # Adjust hostname/port
    username: oracle_user
    password: oracle_password  # Consider using environment variables in production
```

### Build Project

```bash
mvn clean package
```

This will create `target/farm-management-api-1.0.0.jar`

### Run Application
```bash
java -jar target/farm-management-api-1.0.0.jar
```
```

Or start with Maven:
```bash
mvn spring-boot:run
```

The server will start on `http://localhost:8080/api`

### Verify Health

```bash
curl http://localhost:8080/api/health
```

---

## Troubleshooting

### Setup script fails or hangs

- **`sqlplus` not found**: install the Oracle Instant Client or run the
  migration manually using SQL Developer/SQL*Plus.
- **`mvn` not found**: install Maven or use your IDE to build the backend.
- **`npm`/`bun` missing**: install Node.js (includes `npm`) and rerun.

Run the script again and copy any error messages; you can also perform the
steps manually from earlier in this document.

### TypeScript/compilation errors in frontend

If you open the frontend in an editor before installing packages you may see
errors such as:

```
Cannot find module 'react' or its corresponding type declarations.
Property 'env' does not exist on type 'ImportMeta'.
```

These are harmless until the project is built. Simply run `npm install` then
`npm run dev` – the errors will vanish as the build succeeds.

### Oracle connection problems

- **ORA-12154** / **could not resolve**: check the service name and host/port
- **ORA-00942: table or view does not exist**: run the migration script or
  verify the correct schema/user is used

### Backend won’t start

Look at the console output for exceptions. Common issues:
- Missing or incorrect database credentials in `application.yml`
- Port 8080 already in use (change `server.port` in config or free the port)

### CORS errors in browser

Update the allowed origins list in `FarmManagementApiApplication.java` then
rebuild the backend.


Expected response:
```json
{
  "success": true,
  "data": {
    "status": "UP",
    "service": "Farm Management API",
    "version": "1.0.0"
  }
}
```
### Automated Setup Script

For users who want the project configured with minimal manual steps, a PowerShell helper
script is included in the repository.

```powershell
# run from the root of the workspace (Windows only)
.\setup.ps1
```

The script will prompt for Oracle credentials and a JWT secret, write `application.yml`,
execute the migration (if `sqlplus` is available), build the backend, and create
`.env.local` for the frontend. It can even launch the backend and frontend
servers for you.

> ⚠️ The script assumes you are running on Windows and have `sqlplus`, `mvn`, and
> `npm`/`bun` on your PATH. Adjust your environment or perform the equivalent steps
> manually if necessary.
## Frontend Configuration

### Environment Variables

Create or update `.env.local` in the frontend root:

```env
VITE_JAVA_API_URL=http://localhost:8080/api
```

### Install Dependencies

```bash
npm install
# or
bun install
```

### Test Connection

```bash
npm run dev
```

The frontend will connect to the Java backend. Check the console for any errors.

## API Endpoints

### Authentication
- `POST /auth/login` - User login
  - Body: `{ email: string, password: string }`
  - Returns: `{ token: string, user: UserDto }`

- `GET /auth/me` - Get current user
  - Headers: `Authorization: Bearer <token>`
  - Returns: `UserDto`

- `POST /auth/logout` - Logout
  - Returns: null

### Data Operations
- `GET /data/{tableName}` - Select records
  - Query params: `field=value`, `field__gte=value`, `order=field`, `sort=asc|desc`

- `POST /data/{tableName}` - Create record
  - Body: Record data as JSON

- `PUT /data/{tableName}/{id}` - Update record
  - Body: Fields to update

- `DELETE /data/{tableName}/{id}` - Delete record

## Example API Calls

### Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@farmapp.com",
    "password": "admin123"
  }'
```

### Get Current User
```bash
curl -X GET http://localhost:8080/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Select Data
```bash
curl -X GET "http://localhost:8080/api/data/farms?owner_id=123&order=name&sort=asc" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Insert Data
```bash
curl -X POST http://localhost:8080/api/data/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "id": "user-id-123",
    "email": "user@example.com",
    "password_hash": "hashed_password",
    "name": "John Doe"
  }'
```

## Render Deployment

Render clones the repository into its workspace root, so the Maven module is nested under `java-backend`. Configure the service with the following commands:

```bash
# Build (from repo root)
mvn -f java-backend/pom.xml clean package

# Start (Render injects PORT)
java -jar java-backend/target/farm-management-api-1.0.0.jar --server.port=$PORT
```

Render environment variables (use the values supplied by the deployment team):

```
PORT=8080
DB_HOST=database-1.c4vgmck64ako.us-east-1.rds.amazonaws.com
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=greenx300cr
JWT_SECRET=f97f096e34fe54010efec9b5e6869b95
ALLOWED_ORIGINS=https://web-hug-studio-46-043df96f-70335c46-main.vercel.app
SPRING_DATASOURCE_URL=jdbc:postgresql://database-1.c4vgmck64ako.us-east-1.rds.amazonaws.com:5432/postgres
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=greenx300cr
UPLOAD_DIR=./uploads
```

After the Render build succeeds, run the same login/`/auth/me` smoke tests described earlier and document results to verify the deployed service works end-to-end.

## Production Deployment

### Environment Variables

Set these before running in production:

```bash
export JAVA_OPTS="-Xmx512m -Xms256m"
export spring_datasource_url="jdbc:oracle:thin:@prod-db-host:1521:ORCL"
export spring_datasource_username="prod_user"
export spring_datasource_password="prod_password"
export jwt_secret="your-very-long-secure-secret-key-here-use-at-least-32-chars"
export jwt_expiration="86400000"
```

### Build for Production

```bash
mvn clean package -DskipTests -Dspring.profiles.active=prod
```

### Run as Service (Linux)

Create `/etc/systemd/system/farm-api.service`:

```ini
[Unit]
Description=Farm Management API
After=network.target

[Service]
Type=simple
User=farm-api
WorkingDirectory=/opt/farm-api
ExecStart=/usr/lib/jvm/java-17-openjdk/bin/java -jar farm-management-api-1.0.0.jar
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Start service:
```bash
sudo systemctl enable farm-api
sudo systemctl start farm-api
sudo systemctl status farm-api
```

### Docker (Optional)

Create `Dockerfile`:

```dockerfile
FROM openjdk:17-slim
EXPOSE 8080
COPY target/farm-management-api-1.0.0.jar app.jar
ENTRYPOINT ["java", "-jar", "/app.jar"]
```

Build and run:
```bash
docker build -t farm-api:1.0.0 .
docker run -d \
  -e spring_datasource_url="jdbc:oracle:thin:@db-host:1521:ORCL" \
  -e spring_datasource_username="oracle_user" \
  -e spring_datasource_password="oracle_password" \
  -p 8080:8080 \
  farm-api:1.0.0
```

## Troubleshooting

### Database Connection Issues

```
Error: The Network Adapter could not establish the connection
```

**Solutions:**
1. Check Oracle database is running
2. Verify hostname and port in `application.yml`
3. Check firewall rules
4. Test with SQLPlus: `sqlplus oracle_user/oracle_password@ORCL`

### Build Errors

```
Error: Maven compilation failed
```

**Solutions:**
1. Verify Java version: `java -version`
2. Clear Maven cache: `mvn clean`
3. Check for syntax errors in code

### CORS Issues

The CORS filter is configured in `FarmManagementApiApplication.java`. Update allowed origins if needed:

```java
registry.addMapping("/**")
    .allowedOrigins(
        "http://localhost:5173",    // Frontend dev server
        "http://localhost:3000",
        "https://yourdomain.com"    // Add production domain
    )
```

### JWT Token Issues

If experiencing 401 Unauthorized errors:
1. Verify token is being sent in `Authorization: Bearer <token>` header
2. Check token hasn't expired (default 24 hours)
3. Verify `jwt.secret` is configured

## Monitoring

### View Logs

```bash
# Live tail
tail -f nohup.out

# Last 100 lines
tail -100 nohup.out
```

### Health Check

```bash
curl http://localhost:8080/api/health
```

### Performance Monitoring

cd C:\Users\green\web-hug-studio-46-043df96f-70335c46-main
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
```

Then access:
- `http://localhost:8080/api/actuator` - Available endpoints
- `http://localhost:8080/api/actuator/health` - Health status
- `http://localhost:8080/api/actuator/metrics` - Metrics

## Next Steps

1. ✅ Set up Oracle database
2. ✅ Run migration scripts
3. ✅ Build Java backend
4. ✅ Start backend service
5. ✅ Configure frontend `.env.local`
6. ✅ Test connection with frontend
7. Create admin users and test accounts
8. Import production data
9. Set up monitoring and logging
10. Deploy to production server

## Support

For issues or questions:
1. Check logs: `tail -f nohup.out`
2. Test health endpoint
3. Verify database connectivity
4. Check frontend console errors
5. Review application.yml configuration
