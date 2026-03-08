package com.greenx.farmapi;

import com.greenx.farmapi.model.User;
import com.greenx.farmapi.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

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
        };
    }
}
