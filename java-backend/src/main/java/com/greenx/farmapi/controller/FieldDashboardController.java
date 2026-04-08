package com.greenx.farmapi.controller;

import com.greenx.farmapi.dto.ApiResponse;
import com.greenx.farmapi.model.User;
import com.greenx.farmapi.service.FieldManagerService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

/**
 * Canonical /field/** endpoints for the FIELD_MANAGER role.
 *
 * The full feature set lives in {@link FieldManagerController} (/fieldmanager/**).
 * This controller exposes the /field/dashboard path required by the RBAC spec.
 */
@RestController
@RequestMapping("/field")
@RequiredArgsConstructor
@PreAuthorize("hasRole('FIELD_MANAGER')")
public class FieldDashboardController {

    private final FieldManagerService fieldManagerService;

    /**
     * GET /api/field/dashboard
     */
    @GetMapping("/dashboard")
    public ApiResponse<Map<String, Object>> dashboard(Authentication auth) {
        User user = (User) auth.getPrincipal();
        Map<String, Object> result = new HashMap<>(fieldManagerService.getStats(user.getId()));
        result.put("role", "FIELD_MANAGER");
        result.put("message", "Welcome to the GreenX Field Manager Dashboard");
        return ApiResponse.success(result);
    }
}
