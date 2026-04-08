package com.greenx.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v2/land")
@PreAuthorize("hasRole('LANDOWNER')")
public class LandownerController {
    @GetMapping("/dashboard")
    public ResponseEntity<String> getLandownerDashboard() {
        return ResponseEntity.ok("Welcome to Landowner Dashboard");
    }

    @GetMapping("/properties")
    public ResponseEntity<String> getProperties() {
        return ResponseEntity.ok("Landowner properties");
    }
}
