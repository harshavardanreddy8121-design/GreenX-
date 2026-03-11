FROM maven:3.9.9-eclipse-temurin-17 AS builder
WORKDIR /workspace

# Copy only Maven metadata first so dependency layer can cache
COPY java-backend/pom.xml java-backend/pom.xml
RUN mvn -f java-backend/pom.xml dependency:go-offline -q

# Copy sources relative to the root context and build
COPY java-backend/src java-backend/src
RUN mvn -f java-backend/pom.xml clean package -DskipTests -q

FROM eclipse-temurin:17-jdk
WORKDIR /app

COPY --from=builder /workspace/java-backend/target/farm-management-api-1.0.0.jar app.jar

ENV PORT=8080
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar", "--server.port=${PORT}"]