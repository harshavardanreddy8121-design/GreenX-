package com.greenx.farmapi.controller;

import com.greenx.farmapi.dto.ProfileResponse;
import com.greenx.farmapi.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Exposes GET /api/profile for any authenticated user.
 * Security is enforced by SecurityConfig (.requestMatchers("/profile").authenticated()).
 */
@RestController
@RequestMapping("/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final AuthService authService;

    @GetMapping
    public ResponseEntity<ProfileResponse> getProfile(Authentication authentication) {
        String email = authentication.getName();
        ProfileResponse profile = authService.getProfile(email);
        return ResponseEntity.ok(profile);
    }
}
