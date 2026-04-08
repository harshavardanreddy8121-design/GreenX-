package com.greenx.farmapi;

import com.greenx.farmapi.model.User;
import com.greenx.farmapi.repository.UserRepository;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;

@SpringBootApplication
@ComponentScan(basePackages = {"com.greenx"})
@EnableJpaRepositories(basePackages = {"com.greenx"})
@EntityScan(basePackages = {"com.greenx"})
public class FarmManagementApiApplication {

    public static void main(String[] args) {
        SpringApplication.run(FarmManagementApiApplication.class, args);
    }

    @Bean
    CommandLineRunner fixAdminPassword(@Qualifier("farmApiUserRepository") UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            // Ensure every existing user has a unique 4-digit UID.
            Set<String> usedUids = new HashSet<>();
            userRepository.findAll().forEach(u -> {
                if (u.getUid() != null && !u.getUid().isBlank()) {
                    usedUids.add(u.getUid());
                }
            });
            userRepository.findAll().forEach(u -> {
                if (u.getUid() == null || u.getUid().isBlank()) {
                    u.setUid(generateUniqueUid(userRepository, usedUids));
                    userRepository.save(u);
                }
            });

            userRepository.findByEmail("admin@farmapp.com").ifPresent(admin -> {
                if (admin.getUid() == null || admin.getUid().isBlank()) {
                    admin.setUid(generateUniqueUid(userRepository, usedUids));
                }
                if (!passwordEncoder.matches("admin123", admin.getPasswordHash())) {
                    admin.setPasswordHash(passwordEncoder.encode("admin123"));
                }
                userRepository.save(admin);
                System.out.println(">>> Ensured admin@farmapp.com credentials and UID");
            });

            // Ensure requested admin user exists in deployed environments.
            userRepository.findByEmail("harsha@gmail.com").ifPresentOrElse(user -> {
                boolean changed = false;

                if (user.getUid() == null || user.getUid().isBlank()) {
                    user.setUid(generateUniqueUid(userRepository, usedUids));
                    changed = true;
                }

                if (!passwordEncoder.matches("harsha123", user.getPasswordHash())) {
                    user.setPasswordHash(passwordEncoder.encode("harsha123"));
                    changed = true;
                }
                if (user.getRole() == null || !"ADMIN".equalsIgnoreCase(user.getRole())) {
                    user.setRole("ADMIN");
                    changed = true;
                }
                if (user.getIsActive() == null || !user.getIsActive()) {
                    user.setIsActive(true);
                    changed = true;
                }

                if (changed) {
                    userRepository.save(user);
                    System.out.println(">>> Updated harsha@gmail.com as admin user");
                }
            }, () -> {
                User harshaAdmin = User.builder()
                        .id(UUID.randomUUID().toString())
                        .uid(generateUniqueUid(userRepository, usedUids))
                        .email("harsha@gmail.com")
                        .passwordHash(passwordEncoder.encode("harsha123"))
                        .name("Harsha")
                        .role("ADMIN")
                        .isActive(true)
                        .build();
                userRepository.save(harshaAdmin);
                System.out.println(">>> Created harsha@gmail.com admin user");
            });
        };
    }

    private String generateUniqueUid(UserRepository userRepository, Set<String> usedUids) {
        for (int i = 0; i < 10000; i++) {
            String uid = String.format("%04d", ThreadLocalRandom.current().nextInt(0, 10000));
            if (!usedUids.contains(uid) && !userRepository.existsByUid(uid)) {
                usedUids.add(uid);
                return uid;
            }
        }
        throw new RuntimeException("Unable to generate unique 4-digit UID");
    }
}
