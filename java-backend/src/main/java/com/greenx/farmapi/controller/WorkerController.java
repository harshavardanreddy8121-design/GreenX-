package com.greenx.farmapi.controller;

import com.greenx.farmapi.dto.ApiResponse;
import com.greenx.farmapi.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/worker")
@RequiredArgsConstructor
@PreAuthorize("hasRole('WORKER')")
public class WorkerController {

    @GetMapping("/dashboard")
    public ApiResponse<Map<String, String>> getWorkerDashboard(Authentication auth) {
        User user = (User) auth.getPrincipal();
        return ApiResponse.success(Map.of(
                "message", "Welcome to Worker Dashboard",
                "userId", user.getId(),
                "name", user.getName() != null ? user.getName() : ""
        ));
    }

    @GetMapping("/tasks")
    public ApiResponse<String> getTasks() {
        return ApiResponse.success("Worker tasks data");
    }
}
