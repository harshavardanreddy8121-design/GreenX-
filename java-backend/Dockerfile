FROM eclipse-temurin:21-jre-jammy

WORKDIR /app

# Install curl for health checks
RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*

# Copy JAR file
COPY target/farm-management-api-*.jar app.jar

# Default port (Railway overrides with PORT env var)
EXPOSE 8082

# Health check — generous start-period because Spring Boot + RDS ~60-90s startup
HEALTHCHECK --interval=30s --timeout=10s --start-period=120s --retries=3 \
  CMD curl -f http://localhost:${PORT:-8082}/api/health || exit 1

ENV JAVA_OPTS="-Xmx512m -Xms256m"

# Use sh so PORT env var is expanded at runtime
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar /app/app.jar"]
