# Java Backend + Oracle Database Configuration

## Frontend Environment Variables (.env.local)

```env
# Java API Backend Configuration
VITE_JAVA_API_URL=http://localhost:8080/api

# Optional: Oracle Database Connection Details (for documentation)
# These are handled by the Java backend, not the frontend
VITE_ORACLE_HOST=localhost
VITE_ORACLE_PORT=1521
VITE_ORACLE_DATABASE=ORCL
VITE_ORACLE_USER=oracle_user
```

## Java Backend Setup

### Prerequisites
- Java 21 LTS or higher
- Maven 3.8+ or Gradle 7.0+
- Oracle Database (12c or higher)

### Recommended Stack
- **Java Runtime**: Java 21 LTS
- **Backend Framework**: Spring Boot 3.2.0+
- **Database**: Oracle Database (with JDBC driver)
- **ORM**: JPA/Hibernate 6.1+
- **Build Tool**: Maven 3.9+ or Gradle 7.0+

### Java Backend Endpoints Required

The frontend expects the following endpoints from the Java backend:

#### Authentication
- `POST /api/auth/login` - Login with email/password
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

#### Data Operations (Generic)
- `GET /api/data/{tableName}` - Select data with query params
- `POST /api/data/{tableName}` - Insert data
- `PUT /api/data/{tableName}/{id}` - Update data
- `DELETE /api/data/{tableName}/{id}` - Delete data

### Query Parameters for SELECT

```
?field=value          // eq condition
?field__gte=value     // greater than or equal
?order=field          // order by field
?sort=asc|desc        // sort direction
```

### Response Format

All endpoints should return JSON in this format:

```json
{
  "success": true,
  "data": {}
}
```

Or on error:

```json
{
  "success": false,
  "error": "Error message"
}
```

### Oracle Database Schema

The Java backend should maintain these tables:

- `users` - User authentication and profiles
- `farms` - Farm information
- `attendance` - Worker attendance records
- `tasks` - Farm tasks
- `farm_assignments` - User-farm role assignments
- `equipment_requests` - Equipment request tracking

### CORS Configuration

Make sure your Java backend is configured to accept requests from your frontend URL:

```java
@Configuration
public class CorsConfig {
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                    .allowedOrigins("http://localhost:5173", "http://localhost:3000")
                    .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                    .allowCredentials(true);
            }
        };
    }
}
```

### Running the Frontend

```bash
# Install dependencies
npm install
# or
bun install

# Start development server
npm run dev
# or
bun run dev

# The frontend will connect to http://localhost:8080/api by default
```

## Migration from Supabase to Oracle

### Database Migration Steps

1. Export data from Supabase PostgreSQL
2. Map PostgreSQL types to Oracle types
3. Create Oracle tables according to schema
4. Import data into Oracle
5. Create indexes and constraints

### Create Oracle Tables Script Example

```sql
CREATE TABLE USERS (
    ID VARCHAR2(36) PRIMARY KEY,
    EMAIL VARCHAR2(255) NOT NULL UNIQUE,
    PASSWORD_HASH VARCHAR2(255) NOT NULL,
    ROLE VARCHAR2(50),
    NAME VARCHAR2(255),
    CREATED_AT TIMESTAMP DEFAULT SYSDATE,
    UPDATED_AT TIMESTAMP DEFAULT SYSDATE
);

CREATE TABLE FARMS (
    ID VARCHAR2(36) PRIMARY KEY,
    NAME VARCHAR2(255) NOT NULL,
    LOCATION VARCHAR2(500),
    VILLAGE VARCHAR2(255),
    AREA_SQM NUMBER,
    OWNER_ID VARCHAR2(36),
    CREATED_AT TIMESTAMP DEFAULT SYSDATE,
    FOREIGN KEY (OWNER_ID) REFERENCES USERS(ID)
);

-- Add more tables as needed...
```

### Supabase to Oracle Type Mapping

| PostgreSQL | Oracle |
|-----------|--------|
| uuid | VARCHAR2(36) |
| text | VARCHAR2(4000) or CLOB |
| boolean | CHAR(1) |
| timestamp | TIMESTAMP |
| smallint | NUMBER(5) |
| integer | NUMBER(10) |
| bigint | NUMBER(19) |
| decimal | NUMBER(precision, scale) |
| json | VARCHAR2(4000) or CLOB |

