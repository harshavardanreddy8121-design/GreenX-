package com.greenx.farmapi.service;

import com.greenx.farmapi.dto.AuthRequest;
import com.greenx.farmapi.dto.AuthResponse;
import com.greenx.farmapi.dto.ProfileResponse;
import com.greenx.farmapi.dto.UserDto;
import com.greenx.farmapi.model.User;
import com.greenx.farmapi.model.UserRole;
import com.greenx.farmapi.repository.UserRepository;
import com.greenx.farmapi.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;

/**
 * Service layer for authentication operations: register, login, and profile.
 */
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    /**
     * Register a new user.
     *
     * @param request contains email, password, optional role and name
     * @return {@link AuthResponse} with JWT token and user info
     * @throws IllegalArgumentException if email already exists
     */
    public AuthResponse register(AuthRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already registered: " + request.getEmail());
        }

        UserRole role = request.getRole() != null ? request.getRole() : UserRole.LANDOWNER;

        User user = User.builder()
                .id(UUID.randomUUID().toString())
                .uid(generateUniqueUid())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .name(request.getName() != null ? request.getName() : request.getEmail())
                .role(role.name())
                .isActive(true)
                .build();

        user = userRepository.save(user);

        String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole());
        return AuthResponse.builder()
                .token(token)
                .user(UserDto.fromEntity(user))
                .build();
    }

    /**
     * Authenticate an existing user and return a JWT token.
     *
     * @param request contains email and password
     * @return {@link AuthResponse} with JWT token and user info
     * @throws UsernameNotFoundException if no user with that email exists
     * @throws BadCredentialsException   if the password does not match
     */
    public AuthResponse login(AuthRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UsernameNotFoundException(
                        "No account found for: " + request.getEmail()));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid email or password");
        }

        if (user.getIsActive() == null || !user.getIsActive()) {
            throw new BadCredentialsException("Account is deactivated. Please contact admin.");
        }

        String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole());
        return AuthResponse.builder()
                .token(token)
                .user(UserDto.fromEntity(user))
                .build();
    }

    /**
     * Fetch the profile of the currently authenticated user.
     *
     * @param email the authenticated user's email (from JWT)
     * @return {@link ProfileResponse} with full profile details
     */
    public ProfileResponse getProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));

        return ProfileResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(UserRole.fromString(user.getRole()))
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    private String generateUniqueUid() {
        for (int i = 0; i < 10_000; i++) {
            String uid = String.format("%04d", ThreadLocalRandom.current().nextInt(0, 10_000));
            if (!userRepository.existsByUid(uid)) {
                return uid;
            }
        }
        throw new RuntimeException("Unable to generate unique 4-digit UID");
    }
}
