# Farm Management API - Java Backend

RESTful API backend for the Farm Management System using Spring Boot 3.2, Java 21 LTS, and Oracle Database.

## 🎯 Features

- ✅ **Java 21 LTS** - Latest long-term support Java runtime
- ✅ **Spring Boot 3.2** - Modern Spring framework
- ✅ **JWT Authentication** - Secure token-based authentication
- ✅ **Oracle Database** - Enterprise-grade database support
- ✅ **Generic CRUD API** - Flexible data operations
- ✅ **CORS Enabled** - Frontend integration ready
- ✅ **Health Check** - System monitoring endpoint
- ✅ **Error Handling** - Comprehensive exception handling
- ✅ **Docker Support** - Containerized deployment with Java 21

## 🏗️ Project Structure

```
java-backend/
├── src/main/java/com/greenx/farmapi/
│   ├── FarmManagementApiApplication.java      # Spring Boot entry point
│   ├── controller/
│   │   ├── AuthController.java                # Authentication endpoints
│   │   └── DataController.java                # Generic CRUD endpoints
│   ├── service/
│   │   ├── DataService.java                   # Service interface
│   │   └── impl/DataServiceImpl.java           # JDBC implementation
│   ├── model/User.java                        # JPA entity
│   ├── repository/UserRepository.java         # Spring Data JPA
│   ├── dto/
│   │   ├── ApiResponse.java                   # Response wrapper
│   │   ├── AuthResponse.java                  # Auth response
│   │   ├── LoginRequest.java                  # Login request
│   │   └── UserDto.java                       # User DTO
│   └── util/
│       ├── JwtUtil.java                       # JWT token handling
│       └── HealthCheckController.java         # Health endpoint
├── src/main/resources/
│   ├── application.yml                        # Spring Boot config
│   └── db/migration/V1__init_schema.sql       # Database schema
├── Dockerfile                                  # Docker build config
├── pom.xml                                     # Maven dependencies
└── README.md                                   # This file
```

## 🚀 Getting Started

### Prerequisites

- Java 17 or higher
- Maven 3.8+
- Oracle Database 12c or higher

### Quick Start

1. **Clone repository**
   ```bash
   cd java-backend
   ```

2. **Configure database**
   Edit `src/main/resources/application.yml`:
   ```yaml
   spring:
     datasource:
       url: jdbc:oracle:thin:@localhost:1521:ORCL
       username: oracle_user
       password: oracle_password
   ```

3. **Build project**
   ```bash
   mvn clean package
   ```

4. **Run application**
   ```bash
   java -jar target/farm-management-api-1.0.0.jar
   ```

   Or using Maven:
   ```bash
   mvn spring-boot:run
   ```

The API will start on `http://localhost:8080/api`

## 📡 API Endpoints

### Authentication

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzUxMiJ9...",
    "user": {
      "id": "123",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "worker"
    }
  }
}
```

#### Get Current User
```http
GET /auth/me
Authorization: Bearer {token}
```

#### Logout
```http
POST /auth/logout
```

### Data Operations

#### Select Data
```http
GET /data/{tableName}?field=value&order=field&sort=asc
Authorization: Bearer {token}
```

**Query Parameters:**
- `field=value` - Exact match filter
- `field__gte=value` - Greater than or equal
- `field__lte=value` - Less than or equal
- `order=field` - Order by field name
- `sort=asc|desc` - Sort direction

**Example:**
```http
GET /data/farms?owner_id=123&order=name&sort=asc
Authorization: Bearer {token}
```

#### Insert Data
```http
POST /data/{tableName}
Authorization: Bearer {token}
Content-Type: application/json

{
  "field1": "value1",
  "field2": "value2"
}
```

#### Update Data
```http
PUT /data/{tableName}/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "field1": "new_value"
}
```

#### Delete Data
```http
DELETE /data/{tableName}/{id}
Authorization: Bearer {token}
```

### Health Check

```http
GET /health
```

**Response:**
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

## 🗄️ Database Tables

The application requires the following Oracle tables:

| Table | Records | Purpose |
|-------|---------|---------|
| `USERS` | Users | User accounts and authentication |
| `PROFILES` | Profiles | Extended user information |
| `USER_ROLES` | Roles | User role assignments |
| `FARMS` | Farms | Farm information |
| `FARM_ASSIGNMENTS` | Assignments | User-farm relationships |
| `TASKS` | Tasks | Work tasks |
| `ATTENDANCE` | Attendance | Check-in/out records |
| `EQUIPMENT_REQUESTS` | Requests | Equipment requests |
| `DIAGNOSTICS` | Reports | Crop diagnostics |
| `WEATHER` | Weather | Weather data |

Run the migration script to create tables:
```bash
sqlplus oracle_user/oracle_password@ORCL @src/main/resources/db/migration/V1__init_schema.sql
```

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication.

### How it works

1. User logs in with email/password
2. Backend validates credentials
3. Backend generates JWT token with user ID
4. Frontend stores token in localStorage
5. Frontend includes token in `Authorization: Bearer {token}` header for all requests
6. Backend validates token on each request

### Token Configuration

Edit `src/main/resources/application.yml`:
```yaml
jwt:
  secret: your-secret-key-at-least-32-characters-long
  expiration: 86400000  # 24 hours in milliseconds
```

⚠️ **Security Note:** Change the secret in production!

## 🐳 Docker Deployment

### Build Docker Image

```bash
docker build -t farm-api:1.0.0 .
```

### Run Container

```bash
docker run -d \
  -e spring_datasource_url="jdbc:oracle:thin:@oracle-host:1521:ORCL" \
  -e spring_datasource_username="oracle_user" \
  -e spring_datasource_password="oracle_password" \
  -e jwt_secret="your-secret-key" \
  -p 8080:8080 \
  --name farm-api \
  farm-api:1.0.0
```

### Docker Compose

```bash
docker-compose up -d
```

This will start:
- Oracle Database
- Java Backend
- Frontend (optional)

## 🧪 Testing

### Test Health Check

```bash
curl http://localhost:8080/api/health
```

### Test Login

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@farmapp.com",
    "password": "admin123"
  }'
```

### Test Data Retrieval

```bash
BEARER_TOKEN="your_jwt_token_here"

curl -X GET "http://localhost:8080/api/data/farms" \
  -H "Authorization: Bearer $BEARER_TOKEN"
```

## 🔍 Logging

### Configure Logging

Edit `src/main/resources/application.yml`:
```yaml
logging:
  level:
    root: INFO
    com.greenx: DEBUG
  pattern:
    console: "%d{yyyy-MM-dd HH:mm:ss} - %msg%n"
```

### View Logs

```bash
tail -f application.log
```

## 🚢 Production Deployment

### Environment Variables

Required for production:

```bash
export SPRING_DATASOURCE_URL="jdbc:oracle:thin:@prod-db:1521:ORCL"
export SPRING_DATASOURCE_USERNAME="prod_user"
export SPRING_DATASOURCE_PASSWORD="prod_password"
export JWT_SECRET="your-very-long-secure-secret-key"
export JWT_EXPIRATION="86400000"
export SPRING_PROFILES_ACTIVE="prod"
```

### Build for Production

```bash
mvn clean package -DskipTests -P prod
```

### Run as Service

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
Environment="SPRING_DATASOURCE_URL=jdbc:oracle:thin:@..."
Environment="JWT_SECRET=..."

[Install]
WantedBy=multi-user.target
```

Start service:
```bash
sudo systemctl enable farm-api
sudo systemctl start farm-api
sudo systemctl status farm-api
```

## 📊 Monitoring

### Health Status

```bash
curl http://localhost:8080/api/health
```

### Enable Actuator

Add to `pom.xml`:
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
```

### Access Metrics

- `http://localhost:8080/api/actuator` - Available endpoints
- `http://localhost:8080/api/actuator/health` - Health details
- `http://localhost:8080/api/actuator/metrics` - System metrics

## 🐛 Troubleshooting

### Database Connection Error

```
Unable to acquire a Connection from the DataSource
```

**Solution:**
1. Verify Oracle is running: `lsnrctl status`
2. Check connection string in `application.yml`
3. Test with SQLPlus: `sqlplus oracle_user/oracle_password@ORCL`

### Table Not Found

```
ORA-00942: table or view does not exist
```

**Solution:**
```bash
sqlplus oracle_user/oracle_password@ORCL
SELECT * FROM user_tables;  # List all tables
```

Run migration script if tables don't exist.

### CORS Issues

```
Access-Control-Allow-Origin header is missing
```

**Solution:**
Update `allowedOrigins` in `FarmManagementApiApplication.java`:
```java
registry.addMapping("/**")
    .allowedOrigins(
        "http://localhost:5173",
        "https://yourdomain.com"
    )
```

### JWT Token Errors

401 Unauthorized responses indicate token issues.

**Solutions:**
1. Verify token in `Authorization: Bearer <token>` header
2. Check token hasn't expired
3. Use `/auth/login` to get fresh token

## 📚 Dependencies

- Spring Boot 3.2.0
- Spring Security
- Spring Data JPA
- Oracle JDBC Driver
- JWT (io.jsonwebtoken)
- Lombok
- Jakarta EE 10

See `pom.xml` for complete list.

## 📝 License

Proprietary - GreenX Farm Management System

## 🆘 Support

For issues, see:
- [JAVA_BACKEND_DEPLOYMENT.md](../JAVA_BACKEND_DEPLOYMENT.md)
- [COMPLETE_INTEGRATION_GUIDE.md](../COMPLETE_INTEGRATION_GUIDE.md)
- Logs: `tail -f application.log`
