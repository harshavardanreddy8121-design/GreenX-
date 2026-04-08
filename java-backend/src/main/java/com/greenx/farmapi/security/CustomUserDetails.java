package com.greenx.farmapi.security;

import com.greenx.farmapi.model.UserRole;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

/**
 * Lightweight UserDetails implementation that carries email, hashed password,
 * and a resolved {@link UserRole}.  Used by {@link CustomUserDetailsService}.
 */
@Getter
public class CustomUserDetails implements UserDetails {

    private final String email;
    private final String password;
    private final UserRole role;

    public CustomUserDetails(String email, String password, UserRole role) {
        this.email = email;
        this.password = password;
        this.role = role;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.authority()));
    }

    @Override
    public String getPassword() {
        return password;
    }

    /** Spring Security uses this as the "username" (we use email). */
    @Override
    public String getUsername() {
        return email;
    }

    @Override public boolean isAccountNonExpired()     { return true; }
    @Override public boolean isAccountNonLocked()      { return true; }
    @Override public boolean isCredentialsNonExpired() { return true; }
    @Override public boolean isEnabled()               { return true; }
}
