package com.greenx.farmapi.controller;

import com.greenx.farmapi.dto.*;
import com.greenx.farmapi.model.User;
import com.greenx.farmapi.repository.UserRepository;
import com.greenx.farmapi.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
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
            Optional<User> userOpt = userRepository.findByEmail(request.getEmail());
            if (userOpt.isEmpty()) {
                return ApiResponse.error("Invalid email or password");
            }
            User user = userOpt.get();
            if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
                return ApiResponse.error("Invalid email or password");
            }
            if (!user.isEnabled()) {
                return ApiResponse.error("Account is deactivated. Please contact admin.");
            }
            String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole());
            return ApiResponse.success(AuthResponse.builder()
                    .token(token)
                    .user(UserDto.fromEntity(user))
                    .build());
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
