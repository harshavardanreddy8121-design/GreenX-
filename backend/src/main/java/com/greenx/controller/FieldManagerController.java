package com.greenx.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v2/field")
@PreAuthorize("hasRole('FIELD_MANAGER')")
public class FieldManagerController {
    @GetMapping("/dashboard")
    public ResponseEntity<String> getFieldDashboard() {
        return ResponseEntity.ok("Welcome to Field Manager Dashboard");
    }

    @GetMapping("/operations")
    public ResponseEntity<String> getOperations() {
        return ResponseEntity.ok("Field operations data");
    }
}
