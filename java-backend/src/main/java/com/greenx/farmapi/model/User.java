package com.greenx.farmapi.model;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "USERS")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User implements UserDetails {

    @Id
    @Column(name = "ID", length = 36)
    private String id;

    @Column(name = "EMAIL", nullable = false, unique = true, length = 255)
    private String email;

    @Column(name = "UID", length = 4)
    private String uid;

    @Column(name = "PASSWORD_HASH", nullable = false, length = 255)
    private String passwordHash;

    @Column(name = "ROLE", length = 50)
    private String role;

    @Column(name = "NAME", length = 255)
    private String name;

    @Column(name = "PHONE", length = 20)
    private String phone;

    @Column(name = "CLUSTER_ID", length = 36)
    private String clusterId;

    @Column(name = "PROFILE_PHOTO", length = 500)
    private String profilePhoto;

    @Column(name = "IS_ACTIVE")
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "LAST_LOGIN")
    private LocalDateTime lastLogin;

    @Column(name = "CREATED_AT")
    private LocalDateTime createdAt;

    @Column(name = "UPDATED_AT")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (id == null)
            id = UUID.randomUUID().toString();
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (isActive == null)
            isActive = true;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // --- UserDetails implementation ---

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        String r = role != null ? role.toUpperCase().replace("-", "_").replace(" ", "_") : "USER";

        // Normalise legacy spellings
        if ("FIELDMANAGER".equals(r))
            r = "FIELD_MANAGER";

        // Emit both the stored role name AND the canonical UserRole name so that
        // @PreAuthorize checks work regardless of which spelling is in the DB.
        java.util.Set<SimpleGrantedAuthority> authorities = new java.util.LinkedHashSet<>();
        authorities.add(new SimpleGrantedAuthority("ROLE_" + r));

        // Add canonical aliases
        switch (r) {
            case "ADMIN"         -> authorities.add(new SimpleGrantedAuthority("ROLE_CLUSTER_ADMIN"));
            case "CLUSTER_ADMIN" -> authorities.add(new SimpleGrantedAuthority("ROLE_ADMIN"));
            case "LAND_OWNER"    -> authorities.add(new SimpleGrantedAuthority("ROLE_LANDOWNER"));
            case "LANDOWNER"     -> authorities.add(new SimpleGrantedAuthority("ROLE_LAND_OWNER"));
        }

        return authorities;
    }

    @Override
    public String getPassword() {
        return passwordHash;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return isActive != null ? isActive : true;
    }
}
