package com.greenx.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v2/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    @GetMapping("/dashboard")
    public ResponseEntity<String> getAdminDashboard() {
        return ResponseEntity.ok("Welcome to Admin Dashboard");
    }

    @GetMapping("/users")
    public ResponseEntity<String> getAllUsers() {
        return ResponseEntity.ok("List of all users");
    }
}
