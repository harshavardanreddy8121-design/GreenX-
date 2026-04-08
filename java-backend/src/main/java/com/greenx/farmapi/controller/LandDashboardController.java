package com.greenx.farmapi.controller;

import com.greenx.farmapi.dto.ApiResponse;
import com.greenx.farmapi.model.User;
import com.greenx.farmapi.service.LandOwnerService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

/**
 * Canonical /land/** endpoints for the LANDOWNER role.
 *
 * The full feature set lives in {@link LandOwnerController} (/landowner/**).
 * This controller exposes the /land/dashboard path required by the RBAC spec.
 */
@RestController
@RequestMapping("/land")
@RequiredArgsConstructor
@PreAuthorize("hasRole('LANDOWNER') or hasRole('LAND_OWNER')")
public class LandDashboardController {

    private final LandOwnerService landOwnerService;

    /**
     * GET /api/land/dashboard
     */
    @GetMapping("/dashboard")
    public ApiResponse<Map<String, Object>> dashboard(Authentication auth) {
        User user = (User) auth.getPrincipal();
        Map<String, Object> result = new HashMap<>(landOwnerService.getStats(user.getId()));
        result.put("role", "LANDOWNER");
        result.put("message", "Welcome to the GreenX Land Owner Dashboard");
        return ApiResponse.success(result);
    }
}
