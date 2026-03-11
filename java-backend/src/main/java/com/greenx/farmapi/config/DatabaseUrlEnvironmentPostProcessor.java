package com.greenx.farmapi.config;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.net.URI;
import java.util.HashMap;
import java.util.Map;

/**
 * Converts a DATABASE_URL (postgresql://user:pass@host:port/db) environment
 * variable to the JDBC format Spring Boot requires (jdbc:postgresql://host:port/db).
 *
 * Runs before application context is created, so DataSource auto-config
 * sees the correct jdbc: URL and EntityManagerFactory initializes cleanly.
 *
 * Only activates when DATABASE_URL is set and SPRING_DATASOURCE_URL is not.
 * If SPRING_DATASOURCE_URL is already set (preferred for AWS RDS), this
 * processor does nothing.
 */
public class DatabaseUrlEnvironmentPostProcessor implements EnvironmentPostProcessor {

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment,
            SpringApplication application) {

        // If SPRING_DATASOURCE_URL is already set (recommended for AWS RDS),
        // leave everything alone.
        String springUrl = environment.getProperty("SPRING_DATASOURCE_URL");
        if (springUrl != null && !springUrl.isBlank()) {
            return;
        }

        // DATABASE_URL is sometimes provided in "postgresql://..." format by
        // hosting providers. Convert it to JDBC format for Spring Boot.
        String databaseUrl = environment.getProperty("DATABASE_URL");
        if (databaseUrl == null || databaseUrl.isBlank()) {
            return;
        }

        try {
            // java.net.URI needs a valid scheme — swap postgresql:// → http://
            String normalised = databaseUrl
                    .replace("postgresql://", "http://")
                    .replace("postgres://", "http://");
            URI uri = new URI(normalised);

            String host = uri.getHost();
            int port = uri.getPort() == -1 ? 5432 : uri.getPort();
            String db = uri.getPath(); // e.g. "/mydbname" — keep leading slash

            String jdbcUrl = "jdbc:postgresql://" + host + ":" + port + db;

            Map<String, Object> props = new HashMap<>();
            props.put("spring.datasource.url", jdbcUrl);

            String userInfo = uri.getUserInfo();
            if (userInfo != null && !userInfo.isBlank()) {
                String[] parts = userInfo.split(":", 2);
                props.put("spring.datasource.username", parts[0]);
                if (parts.length > 1) {
                    props.put("spring.datasource.password", parts[1]);
                }
            }

            // addFirst so our derived values override application.yml defaults
            environment.getPropertySources()
                    .addFirst(new MapPropertySource("database-url-processor", props));

            System.out.println("[GreenX] DATABASE_URL resolved to JDBC: "
                    + jdbcUrl.replaceAll("//[^@]+@", "//<credentials>@"));

        } catch (Exception e) {
            System.err.println("[GreenX] Could not parse DATABASE_URL: " + e.getMessage());
        }
    }
}
