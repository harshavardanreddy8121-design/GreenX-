package com.greenx.farmapi.dto;

import com.greenx.farmapi.model.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Unified request DTO for both /auth/register and /auth/login.
 * The {@code role} and {@code name} fields are only used during registration.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be a valid email address")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    /** Optional — used only for registration. Defaults to LANDOWNER when absent. */
    private UserRole role;

    /** Optional — display name, used only for registration. */
    private String name;
}
