package com.greenx.farmapi.controller;

import com.greenx.farmapi.dto.*;
import com.greenx.farmapi.model.User;
import com.greenx.farmapi.repository.UserRepository;
import com.greenx.farmapi.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;
import java.util.concurrent.ThreadLocalRandom;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    @PostMapping("/register")
    public ApiResponse<AuthResponse> register(@RequestBody RegisterRequest request) {
        try {
            if (userRepository.findByEmail(request.getEmail()).isPresent()) {
                return ApiResponse.error("User with this email already exists");
            }
            User user = User.builder()
                    .email(request.getEmail())
                    .uid(generateUniqueUid())
                    .passwordHash(passwordEncoder.encode(request.getPassword()))
                    .name(request.getName())
                    .role(request.getRole() != null ? request.getRole().toUpperCase() : "LAND_OWNER")
                    .isActive(true)
                    .build();
            user = userRepository.save(user);
            String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole());
            return ApiResponse.success(AuthResponse.builder()
                    .token(token)
                    .user(UserDto.fromEntity(user))
                    .build());
        } catch (Exception e) {
            return ApiResponse.error("Registration failed: " + e.getMessage());
        }
    }

    @PostMapping("/login")
    public ApiResponse<AuthResponse> login(@RequestBody LoginRequest request) {
        try {
            if (request == null || request.getEmail() == null || request.getPassword() == null) {
                return ApiResponse.error("Email and password are required");
            }

            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

            Optional<User> userOpt = userRepository.findByEmail(request.getEmail());
            if (userOpt.isEmpty()) {
                return ApiResponse.error("Invalid email or password");
            }

            User user = userOpt.get();
            if (!user.isEnabled()) {
                return ApiResponse.error("Account is deactivated. Please contact admin.");
            }

            String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole());
            return ApiResponse.success(AuthResponse.builder()
                    .token(token)
                    .user(UserDto.fromEntity(user))
                    .build());
        } catch (BadCredentialsException e) {
            return ApiResponse.error("Invalid email or password");
        } catch (DisabledException e) {
            return ApiResponse.error("Account is deactivated. Please contact admin.");
        } catch (AuthenticationException e) {
            return ApiResponse.error("Authentication failed");
        } catch (Exception e) {
            return ApiResponse.error("Login failed: " + e.getMessage());
        }
    }

    @GetMapping("/me")
    public ApiResponse<UserDto> getCurrentUser(HttpServletRequest request) {
        try {
            String token = extractToken(request);
            if (token == null || !jwtUtil.validateToken(token)) {
                return ApiResponse.error("Invalid or missing token");
            }
            String userId = jwtUtil.extractUserId(token);
            return userRepository.findById(userId)
                    .map(u -> ApiResponse.success(UserDto.fromEntity(u)))
                    .orElse(ApiResponse.error("User not found"));
        } catch (Exception e) {
            return ApiResponse.error("Failed to get current user: " + e.getMessage());
        }
    }

    @GetMapping("/demo-token")
    public ApiResponse<AuthResponse> getDemoToken() {
        try {
            final String DEMO_EMAIL = "demo@greenx.local";
            final String DEMO_ID = "demo-user";
            final String DEMO_NAME = "Demo Land Owner";
            final String DEMO_ROLE = "LAND_OWNER";

            // Find or create the demo user so the JWT filter can load it by email
            User demoUser = userRepository.findByEmail(DEMO_EMAIL).orElseGet(() -> {
                User u = User.builder()
                        .id(DEMO_ID)
                        .email(DEMO_EMAIL)
                        .uid("0000")
                        .passwordHash(passwordEncoder.encode("demo-password-not-used"))
                        .name(DEMO_NAME)
                        .role(DEMO_ROLE)
                        .isActive(true)
                        .build();
                return userRepository.save(u);
            });

            String token = jwtUtil.generateToken(demoUser.getId(), demoUser.getEmail(), demoUser.getRole());
            return ApiResponse.success(AuthResponse.builder()
                    .token(token)
                    .user(UserDto.fromEntity(demoUser))
                    .build());
        } catch (Exception e) {
            return ApiResponse.error("Failed to generate demo token: " + e.getMessage());
        }
    }

    @PostMapping("/logout")
    public ApiResponse<String> logout() {
        return ApiResponse.success("Logged out");
    }

    private String extractToken(HttpServletRequest req) {
        String h = req.getHeader("Authorization");
        return (h != null && h.startsWith("Bearer ")) ? h.substring(7) : null;
    }

    private String generateUniqueUid() {
        for (int i = 0; i < 10000; i++) {
            String uid = String.format("%04d", ThreadLocalRandom.current().nextInt(0, 10000));
            if (!userRepository.existsByUid(uid)) {
                return uid;
            }
        }
        throw new RuntimeException("Unable to generate unique 4-digit UID");
    }

}
