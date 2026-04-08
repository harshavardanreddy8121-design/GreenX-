package com.greenx.farmapi.controller;

import com.greenx.farmapi.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Endpoints accessible only to users with the WORKER role.
 */
@RestController
@RequestMapping("/worker")
@RequiredArgsConstructor
@PreAuthorize("hasRole('WORKER')")
public class WorkerController {

    /**
     * GET /api/worker/dashboard
     * Returns a simple dashboard summary for worker users.
     */
    @GetMapping("/dashboard")
    public ApiResponse<Map<String, Object>> dashboard(Authentication auth) {
        return ApiResponse.success(Map.of(
                "role", "WORKER",
                "message", "Welcome to the GreenX Worker Dashboard",
                "email", auth.getName()
        ));
    }
}
