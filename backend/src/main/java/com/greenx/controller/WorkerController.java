package com.greenx.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v2/worker")
@PreAuthorize("hasRole('WORKER')")
public class WorkerController {
    @GetMapping("/dashboard")
    public ResponseEntity<String> getWorkerDashboard() {
        return ResponseEntity.ok("Welcome to Worker Dashboard");
    }

    @GetMapping("/tasks")
    public ResponseEntity<String> getTasks() {
        return ResponseEntity.ok("Worker tasks");
    }
}
