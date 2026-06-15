package com.greenx.farmapi.controller;

import com.greenx.farmapi.dto.ApiResponse;
import com.greenx.farmapi.model.User;
import com.greenx.farmapi.service.LandownerDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Dashboard API endpoints for the LANDOWNER role.
 * All routes are under /landowner/dashboard/** and require LANDOWNER or LAND_OWNER role.
 */
@RestController
@RequestMapping("/landowner/dashboard")
@RequiredArgsConstructor
@PreAuthorize("hasRole('LAND_OWNER') or hasRole('LANDOWNER')")
public class LandownerDashboardController {

    private final LandownerDashboardService dashboardService;

    /**
     * GET /api/landowner/dashboard/overview
     * Returns aggregate stats: total land area, input costs, soil samples, active farms.
     */
    @GetMapping("/overview")
    public ApiResponse<Map<String, Object>> getOverview(Authentication auth) {
        try {
            User user = (User) auth.getPrincipal();
            return ApiResponse.success(dashboardService.getOverviewData(user.getId()));
        } catch (Exception e) {
            return ApiResponse.error("Error fetching overview: " + e.getMessage());
        }
    }

    /**
     * GET /api/landowner/dashboard/soil-samples
     * Returns all soil reports for the landowner's farms, formatted as sample list.
     */
    @GetMapping("/soil-samples")
    public ApiResponse<Map<String, Object>> getSoilSamples(Authentication auth) {
        try {
            User user = (User) auth.getPrincipal();
            return ApiResponse.success(dashboardService.getSoilSamples(user.getId()));
        } catch (Exception e) {
            return ApiResponse.error("Error fetching soil samples: " + e.getMessage());
        }
    }

    /**
     * GET /api/landowner/dashboard/soil-reports?limit=5
     * Returns the latest N soil reports with full nutrient data.
     */
    @GetMapping("/soil-reports")
    public ApiResponse<Map<String, Object>> getLatestSoilReports(
            @RequestParam(defaultValue = "5") int limit,
            Authentication auth) {
        try {
            User user = (User) auth.getPrincipal();
            return ApiResponse.success(dashboardService.getLatestSoilReports(user.getId(), limit));
        } catch (Exception e) {
            return ApiResponse.error("Error fetching soil reports: " + e.getMessage());
        }
    }

    /**
     * GET /api/landowner/dashboard/crop-suggestions
     * Returns all crop suggestions for the landowner's farms, newest first.
     */
    @GetMapping("/crop-suggestions")
    public ApiResponse<Map<String, Object>> getCropSuggestions(Authentication auth) {
        try {
            User user = (User) auth.getPrincipal();
            return ApiResponse.success(dashboardService.getCropSuggestions(user.getId()));
        } catch (Exception e) {
            return ApiResponse.error("Error fetching crop suggestions: " + e.getMessage());
        }
    }

    /**
     * GET /api/landowner/dashboard/soil-timeline
     * Returns a 5-stage timeline of the soil sampling process.
     */
    @GetMapping("/soil-timeline")
    public ApiResponse<Map<String, Object>> getSoilTimeline(Authentication auth) {
        try {
            User user = (User) auth.getPrincipal();
            return ApiResponse.success(dashboardService.getSoilTimeline(user.getId()));
        } catch (Exception e) {
            return ApiResponse.error("Error fetching soil timeline: " + e.getMessage());
        }
    }

    /**
     * GET /api/landowner/dashboard/finance-summary
     * Returns expense/income totals, profit/loss, and breakdown by update type.
     */
    @GetMapping("/finance-summary")
    public ApiResponse<Map<String, Object>> getFinanceSummary(Authentication auth) {
        try {
            User user = (User) auth.getPrincipal();
            return ApiResponse.success(dashboardService.getFinanceSummary(user.getId()));
        } catch (Exception e) {
            return ApiResponse.error("Error fetching finance summary: " + e.getMessage());
        }
    }
}
