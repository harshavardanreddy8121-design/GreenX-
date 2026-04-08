package com.greenx.farmapi.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Date;

@Component
public class JwtUtil {

    private static final Logger log = LoggerFactory.getLogger(JwtUtil.class);

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expiration}")
    private long jwtExpirationMs;

    private SecretKey getSigningKey() {
        byte[] secretBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);

        // HS512 requires >= 64 bytes. Derive a stable strong key if env secret is too
        // short.
        if (secretBytes.length < 64) {
            log.warn(
                    "JWT secret is shorter than 64 bytes; deriving HS512 key via SHA-512. Configure JWT_SECRET to at least 64 bytes in production.");
            try {
                secretBytes = MessageDigest.getInstance("SHA-512").digest(secretBytes);
            } catch (NoSuchAlgorithmException e) {
                throw new IllegalStateException("Unable to initialize JWT signing key", e);
            }
        }

        return Keys.hmacShaKeyFor(secretBytes);
    }

    public String generateToken(String userId, String email, String role) {
        return Jwts.builder()
                .subject(userId)
                .claim("email", email)
                .claim("role", role)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + jwtExpirationMs))
                .signWith(getSigningKey())
                .compact();
    }

    /** Backward-compat overload used by callers that don't have role */
    public String generateToken(String userId, String email) {
        return generateToken(userId, email, "USER");
    }

    public String extractUserId(String token) {
        try {
            return parseClaims(token).getSubject();
        } catch (Exception e) {
            return null;
        }
    }

    public String extractEmail(String token) {
        try {
            return parseClaims(token).get("email", String.class);
        } catch (Exception e) {
            return null;
        }
    }

    public String extractRole(String token) {
        try {
            return parseClaims(token).get("role", String.class);
        } catch (Exception e) {
            return null;
        }
    }

    public boolean validateToken(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    public boolean isTokenExpired(String token) {
        try {
            return parseClaims(token).getExpiration().before(new Date());
        } catch (Exception e) {
            return true;
        }
    }

    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
