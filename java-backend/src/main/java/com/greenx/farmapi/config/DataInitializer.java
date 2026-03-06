package com.greenx.farmapi.config;

import com.greenx.farmapi.model.User;
import com.greenx.farmapi.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.UUID;

/**
 * Seeds essential users into the database on startup if they don't already exist.
 * Credentials are read from environment variables; defaults are used when the
 * variables are not set (suitable for local development only).
 */
@Component
@RequiredArgsConstructor
public class DataInitializer implements ApplicationRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(ApplicationArguments args) {
        String email    = getEnv("ADMIN_EMAIL",    "harshavardanreddy7730@gmail.com");
        String password = getEnv("ADMIN_PASSWORD", "harsha@2004");
        String name     = getEnv("ADMIN_NAME",     "Harsha Vardhan Reddy");
        seedUser(email, password, name, "admin");
    }

    private void seedUser(String email, String password, String name, String role) {
        if (userRepository.existsByEmail(email)) {
            return;
        }

        String userId = UUID.randomUUID().toString();

        User user = User.builder()
            .id(userId)
            .email(email)
            .passwordHash(passwordEncoder.encode(password))
            .role(role)
            .name(name)
            .build();
        userRepository.save(user);

        // Create USER_ROLES entry
        jdbcTemplate.update(
            "INSERT INTO USER_ROLES (ID, USER_ID, ROLE) VALUES (?, ?, ?)",
            UUID.randomUUID().toString(), userId, role
        );

        // Create PROFILES entry
        jdbcTemplate.update(
            "INSERT INTO PROFILES (ID, FULL_NAME) VALUES (?, ?)",
            userId, name
        );
    }

    private String getEnv(String name, String defaultValue) {
        String value = System.getenv(name);
        return (value != null && !value.isBlank()) ? value : defaultValue;
    }
}
