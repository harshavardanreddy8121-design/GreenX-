package com.greenx.farmapi.exception;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.stream.Collectors;

/**
 * Centralised exception → HTTP response mapping for the GreenX API.
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    // ── 400 Bad Request ───────────────────────────────────────────────────────

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(
            MethodArgumentNotValidException ex, HttpServletRequest request) {

        String message = ex.getBindingResult().getFieldErrors().stream()
                .map(FieldError::getDefaultMessage)
                .collect(Collectors.joining("; "));

        return build(HttpStatus.BAD_REQUEST, message, request);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgument(
            IllegalArgumentException ex, HttpServletRequest request) {
        return build(HttpStatus.BAD_REQUEST, ex.getMessage(), request);
    }

    // ── 401 Unauthorized ──────────────────────────────────────────────────────

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErrorResponse> handleBadCredentials(
            BadCredentialsException ex, HttpServletRequest request) {
        return build(HttpStatus.UNAUTHORIZED, ex.getMessage(), request);
    }

    @ExceptionHandler(UsernameNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleUsernameNotFound(
            UsernameNotFoundException ex, HttpServletRequest request) {
        return build(HttpStatus.UNAUTHORIZED, ex.getMessage(), request);
    }

    // ── 403 Forbidden ─────────────────────────────────────────────────────────

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(
            AccessDeniedException ex, HttpServletRequest request) {
        return build(HttpStatus.FORBIDDEN, "Access denied: " + ex.getMessage(), request);
    }

    // ── 500 Internal Server Error ─────────────────────────────────────────────

    /**
     * Handles database-level errors including PostgreSQL LOB stream failures.
     * These occur when @Lob fields are accessed outside a transaction or when
     * the connection is closed before the large object stream is fully read.
     */
    @ExceptionHandler(DataAccessException.class)
    public ResponseEntity<ErrorResponse> handleDataAccess(
            DataAccessException ex, HttpServletRequest request) {
        String message = ex.getMessage() != null ? ex.getMessage() : "Database error";
        // Provide a friendlier message for LOB stream errors
        if (message.contains("lob stream") || message.contains("large object")
                || message.contains("Unable to access")) {
            log.error("PostgreSQL LOB stream error at {}: {}", request.getRequestURI(), message);
            return build(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Database read error: a large object field could not be accessed. "
                            + "Please try again or contact support.",
                    request);
        }
        log.error("Data access error at {}: {}", request.getRequestURI(), message);
        return build(HttpStatus.INTERNAL_SERVER_ERROR,
                "Database error: " + message, request);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneric(
            Exception ex, HttpServletRequest request) {
        log.error("Unexpected error at {}: {}", request.getRequestURI(), ex.getMessage(), ex);
        return build(HttpStatus.INTERNAL_SERVER_ERROR,
                "An unexpected error occurred: " + ex.getMessage(), request);
    }

    // ── helper ────────────────────────────────────────────────────────────────

    private ResponseEntity<ErrorResponse> build(HttpStatus status, String message,
                                                 HttpServletRequest request) {
        ErrorResponse body = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(status.value())
                .message(message)
                .path(request.getRequestURI())
                .build();
        return ResponseEntity.status(status).body(body);
    }
}
