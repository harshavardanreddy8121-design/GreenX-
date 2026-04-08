package com.greenx.farmapi.security;

import com.greenx.farmapi.model.User;
import com.greenx.farmapi.model.UserRole;
import com.greenx.farmapi.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

/**
 * Loads a {@link CustomUserDetails} from the database by email.
 * Registered as a Spring bean so it can be injected into SecurityConfig
 * alongside the existing {@link UserDetailsServiceImpl}.
 */
@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));

        UserRole role = UserRole.fromString(user.getRole());
        return new CustomUserDetails(user.getEmail(), user.getPasswordHash(), role);
    }
}
