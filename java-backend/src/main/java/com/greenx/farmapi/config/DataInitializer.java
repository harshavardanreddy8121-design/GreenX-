package com.greenx.farmapi.config;

import com.greenx.farmapi.model.User;
import com.greenx.farmapi.model.UserRole;
import com.greenx.farmapi.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;

/**
 * Seeds one sample user per role on application startup.
 * Users are only created if they do not already exist (idempotent).
 *
 * Credentials (for testing only — change in production):
 *   admin@greenx.com        / password123  (ADMIN)
 *   expert@greenx.com       / password123  (EXPERT)
 *   fieldmanager@greenx.com / password123  (FIELD_MANAGER)
 *   worker@greenx.com       / password123  (WORKER)
 *   landowner@greenx.com    / password123  (LANDOWNER)
 */
@Component
@Order(2)   // Run after the existing CommandLineRunner in FarmManagementApiApplication (Order 1)
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private static final String DEFAULT_PASSWORD = "password123";

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        List<SeedUser> seeds = List.of(
                new SeedUser("admin@greenx.com",        "GreenX Admin",        UserRole.ADMIN),
                new SeedUser("expert@greenx.com",       "GreenX Expert",       UserRole.EXPERT),
                new SeedUser("fieldmanager@greenx.com", "GreenX Field Manager",UserRole.FIELD_MANAGER),
                new SeedUser("worker@greenx.com",       "GreenX Worker",       UserRole.WORKER),
                new SeedUser("landowner@greenx.com",    "GreenX Land Owner",   UserRole.LANDOWNER)
        );

        for (SeedUser seed : seeds) {
            if (!userRepository.existsByEmail(seed.email())) {
                User user = User.builder()
                        .id(UUID.randomUUID().toString())
                        .uid(generateUniqueUid())
                        .email(seed.email())
                        .passwordHash(passwordEncoder.encode(DEFAULT_PASSWORD))
                        .name(seed.name())
                        .role(seed.role().name())
                        .isActive(true)
                        .build();
                userRepository.save(user);
                log.info(">>> DataInitializer: created sample user {} ({})", seed.email(), seed.role());
            } else {
                log.debug(">>> DataInitializer: user {} already exists, skipping", seed.email());
            }
        }
    }

    private String generateUniqueUid() {
        for (int i = 0; i < 10_000; i++) {
            String uid = String.format("%04d", ThreadLocalRandom.current().nextInt(0, 10_000));
            if (!userRepository.existsByUid(uid)) {
                return uid;
            }
        }
        throw new RuntimeException("Unable to generate unique 4-digit UID for seed user");
    }

    private record SeedUser(String email, String name, UserRole role) {}
}
