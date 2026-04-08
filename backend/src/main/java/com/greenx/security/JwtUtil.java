package com.greenx.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Date;

@Component("greenxJwtUtil")
public class JwtUtil {
    @Value("${jwt.secret:your-secret-key-change-this-in-production-with-at-least-32-characters-minimum}")
    private String jwtSecret;

    @Value("${jwt.expiration:86400000}")
    private long jwtExpiration;

    private SecretKey getSigningKey() {
        byte[] secretBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);
        // Ensure key is at least 32 bytes for HS256
        if (secretBytes.length < 32) {
            try {
                secretBytes = MessageDigest.getInstance("SHA-256").digest(secretBytes);
            } catch (NoSuchAlgorithmException e) {
                throw new IllegalStateException("Unable to initialize JWT signing key", e);
            }
        }
        return Keys.hmacShaKeyFor(secretBytes);
    }

    public String generateToken(String email, String role) {
        return Jwts.builder()
                .subject(email)
                .claim("role", role)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + jwtExpiration))
                .signWith(getSigningKey())
                .compact();
    }

    public String extractEmail(String token) {
        return getClaims(token).getSubject();
    }

    public String extractRole(String token) {
        return getClaims(token).get("role", String.class);
    }

    public boolean isTokenValid(String token) {
        try {
            getClaims(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    private Claims getClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
