package com.greenx.farmapi.service;

import com.greenx.farmapi.dto.AuthResponse;
import com.greenx.farmapi.dto.LoginRequest;
import com.greenx.farmapi.dto.RegisterRequest;
import com.greenx.farmapi.dto.UserDto;
import com.greenx.farmapi.dto.UserProfileResponse;
import com.greenx.farmapi.exception.ResourceNotFoundException;
import com.greenx.farmapi.exception.UserAlreadyExistsException;
import com.greenx.farmapi.model.User;
import com.greenx.farmapi.repository.UserRepository;
import com.greenx.farmapi.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.concurrent.ThreadLocalRandom;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new UserAlreadyExistsException(
                    "User with email " + request.getEmail() + " already exists");
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

        return AuthResponse.builder()
                .token(token)
                .user(UserDto.fromEntity(user))
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));
        } catch (BadCredentialsException e) {
            throw new ResourceNotFoundException("Invalid email or password");
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found with email: " + request.getEmail()));

        if (!user.isEnabled()) {
            throw new ResourceNotFoundException("Account is deactivated. Please contact admin.");
        }

        String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole());

        return AuthResponse.builder()
                .token(token)
                .user(UserDto.fromEntity(user))
                .build();
    }

    public UserProfileResponse getProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return UserProfileResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .uid(user.getUid())
                .phone(user.getPhone())
                .clusterId(user.getClusterId())
                .build();
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
