package com.greenx.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v2/expert")
@PreAuthorize("hasRole('EXPERT')")
public class ExpertController {
    @GetMapping("/dashboard")
    public ResponseEntity<String> getExpertDashboard() {
        return ResponseEntity.ok("Welcome to Expert Dashboard");
    }

    @GetMapping("/analysis")
    public ResponseEntity<String> getAnalysis() {
        return ResponseEntity.ok("Expert analysis data");
    }
}
