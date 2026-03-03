package com.greenx.farmapi.controller;

import com.greenx.farmapi.dto.*;
import com.greenx.farmapi.model.User;
import com.greenx.farmapi.repository.UserRepository;
import com.greenx.farmapi.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;
import java.util.Optional;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    
    /**
     * Login endpoint - authenticate user and return JWT token
     */
    @PostMapping("/login")
    public ApiResponse<AuthResponse> login(@RequestBody LoginRequest request) {
        try {
            Optional<User> userOpt = userRepository.findByEmail(request.getEmail());
            
            if (userOpt.isEmpty()) {
                return ApiResponse.error("User not found");
            }
            
            User user = userOpt.get();
            
            // Verify password
            if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
                return ApiResponse.error("Invalid credentials");
            }
            
            // Generate JWT token
            String token = jwtUtil.generateToken(user.getId(), user.getEmail());
            
            AuthResponse response = AuthResponse.builder()
                .token(token)
                .user(UserDto.fromEntity(user))
                .build();
            
            return ApiResponse.success(response);
        } catch (Exception e) {
            return ApiResponse.error("Login failed: " + e.getMessage());
        }
    }
    
    /**
     * Get current user from token
     */
    @GetMapping("/me")
    public ApiResponse<UserDto> getCurrentUser(HttpServletRequest request) {
        try {
            String token = extractTokenFromRequest(request);
            
            if (token == null || !jwtUtil.validateToken(token)) {
                return ApiResponse.error("Invalid or missing token");
            }
            
            String userId = jwtUtil.extractUserId(token);
            Optional<User> userOpt = userRepository.findById(userId);
            
            if (userOpt.isEmpty()) {
                return ApiResponse.error("User not found");
            }
            
            return ApiResponse.success(UserDto.fromEntity(userOpt.get()));
        } catch (Exception e) {
            return ApiResponse.error("Failed to get current user: " + e.getMessage());
        }
    }
    
    /**
     * Logout endpoint (optional - JWT is stateless)
     */
    @PostMapping("/logout")
    public ApiResponse<Void> logout() {
        // JWT is stateless, so logout is handled on client side by removing token
        return ApiResponse.success(null);
    }
    
    /**
     * Extract JWT token from Authorization header
     */
    private String extractTokenFromRequest(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        return null;
    }
}
