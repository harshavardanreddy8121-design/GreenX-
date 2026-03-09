package com.greenx.farmapi;

import com.greenx.farmapi.model.User;
import com.greenx.farmapi.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.UUID;

@SpringBootApplication
public class FarmManagementApiApplication {

    public static void main(String[] args) {
        SpringApplication.run(FarmManagementApiApplication.class, args);
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    CommandLineRunner fixAdminPassword(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            userRepository.findByEmail("admin@farmapp.com").ifPresent(admin -> {
                if (!passwordEncoder.matches("admin123", admin.getPasswordHash())) {
                    admin.setPasswordHash(passwordEncoder.encode("admin123"));
                    userRepository.save(admin);
                    System.out.println(">>> Fixed admin@farmapp.com password hash");
                }
            });

            // Ensure requested admin user exists in deployed environments.
            userRepository.findByEmail("harsha@gmail.com").ifPresentOrElse(user -> {
                boolean changed = false;

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
}
