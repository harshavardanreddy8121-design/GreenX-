package com.greenx.farmapi.service;

import com.greenx.farmapi.model.User;
import com.greenx.farmapi.model.UserRole;
import com.greenx.farmapi.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * General-purpose user query service.
 */
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    /**
     * Fetch a user by email, throwing {@link UsernameNotFoundException} if absent.
     */
    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));
    }

    /** Return all users in the system. */
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    /**
     * Return all users that have the given role.
     * Tolerates legacy role spellings via {@link UserRole#fromString(String)}.
     */
    public List<User> getUsersByRole(UserRole role) {
        // Use the flexible query that normalises underscores/case
        return userRepository.findByRoleFlexible(role.name());
    }
}
