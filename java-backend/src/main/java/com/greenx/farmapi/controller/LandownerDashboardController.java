package com.greenx.farmapi.controller;

import com.greenx.farmapi.dto.ApiResponse;
import com.greenx.farmapi.dto.DashboardDTOs.*;
import com.greenx.farmapi.entity.Farm;
import com.greenx.farmapi.model.User;
import com.greenx.farmapi.repository.FarmRepository;
import com.greenx.farmapi.service.LandownerDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Dashboard API endpoints for the Land Owner role.
 * All routes are under /landowner/dashboard/** which is already secured
 * by the /landowner/** rule in SecurityConfig.
 */
@RestController
@RequestMapping("/landowner/dashboard")
@RequiredArgsConstructor
@PreAuthorize("hasRole('LAND_OWNER') or hasRole('LANDOWNER')")
public class LandownerDashboardController {

    private final LandownerDashboardService dashboardService;
    private final FarmRepository farmRepository;

    /**
     * GET /api/landowner/dashboard/overview
     * Aggregated stats across all farms owned by the authenticated user.
     */
    @GetMapping("/overview")
    public ApiResponse<DashboardOverviewDTO> getOverview(Authentication auth) {
        try {
            User user = (User) auth.getPrincipal();
            return ApiResponse.success(dashboardService.getOverview(user.getId()));
        } catch (Exception e) {
            return ApiResponse.error("Error fetching overview: " + e.getMessage());
        }
    }

    /**
     * GET /api/landowner/dashboard/farms/{farmId}/soil-samples
     * Soil samples collected for a specific farm.
     */
    @GetMapping("/farms/{farmId}/soil-samples")
    public ApiResponse<SoilSamplesDTO> getSoilSamples(
            @PathVariable String farmId, Authentication auth) {
        try {
            verifyFarmOwnership(farmId, auth);
            return ApiResponse.success(dashboardService.getSoilSamples(farmId));
        } catch (SecurityException se) {
            return ApiResponse.error(se.getMessage());
        } catch (Exception e) {
            return ApiResponse.error("Error fetching soil samples: " + e.getMessage());
        }
    }

    /**
     * GET /api/landowner/dashboard/farms/{farmId}/soil-reports
     * Soil analysis reports shared with the land owner for a specific farm.
     */
    @GetMapping("/farms/{farmId}/soil-reports")
    public ApiResponse<List<SoilReportDTO>> getSoilReports(
            @PathVariable String farmId, Authentication auth) {
        try {
            verifyFarmOwnership(farmId, auth);
            return ApiResponse.success(dashboardService.getSoilReports(farmId));
        } catch (SecurityException se) {
            return ApiResponse.error(se.getMessage());
        } catch (Exception e) {
            return ApiResponse.error("Error fetching soil reports: " + e.getMessage());
        }
    }

    /**
     * GET /api/landowner/dashboard/farms/{farmId}/crop-suggestions
     * Expert crop suggestions for a specific farm.
     */
    @GetMapping("/farms/{farmId}/crop-suggestions")
    public ApiResponse<List<CropSuggestionDTO>> getCropSuggestions(
            @PathVariable String farmId, Authentication auth) {
        try {
            verifyFarmOwnership(farmId, auth);
            return ApiResponse.success(dashboardService.getCropSuggestions(farmId));
        } catch (SecurityException se) {
            return ApiResponse.error(se.getMessage());
        } catch (Exception e) {
            return ApiResponse.error("Error fetching crop suggestions: " + e.getMessage());
        }
    }

    /**
     * GET /api/landowner/dashboard/farms/{farmId}/soil-sample-timeline
     * Step-by-step timeline of the soil sampling process for a specific farm.
     */
    @GetMapping("/farms/{farmId}/soil-sample-timeline")
    public ApiResponse<SoilSampleTimelineDTO> getSoilSampleTimeline(
            @PathVariable String farmId, Authentication auth) {
        try {
            verifyFarmOwnership(farmId, auth);
            return ApiResponse.success(dashboardService.getSoilSampleTimeline(farmId));
        } catch (SecurityException se) {
            return ApiResponse.error(se.getMessage());
        } catch (Exception e) {
            return ApiResponse.error("Error fetching timeline: " + e.getMessage());
        }
    }

    /**
     * GET /api/landowner/dashboard/farms/{farmId}/finance-summary
     * Income, expense, and profit/loss summary for a specific farm.
     */
    @GetMapping("/farms/{farmId}/finance-summary")
    public ApiResponse<FinanceSummaryDTO> getFinanceSummary(
            @PathVariable String farmId, Authentication auth) {
        try {
            verifyFarmOwnership(farmId, auth);
            return ApiResponse.success(dashboardService.getFinanceSummary(farmId));
        } catch (SecurityException se) {
            return ApiResponse.error(se.getMessage());
        } catch (Exception e) {
            return ApiResponse.error("Error fetching finance summary: " + e.getMessage());
        }
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    /**
     * Verifies that the authenticated user owns the given farm.
     * Throws SecurityException if the farm does not belong to the user.
     */
    private void verifyFarmOwnership(String farmId, Authentication auth) {
        User user = (User) auth.getPrincipal();
        Farm farm = farmRepository.findById(farmId).orElse(null);
        if (farm == null) {
            throw new SecurityException("Farm not found: " + farmId);
        }
        if (!farm.getOwnerId().equals(user.getId())) {
            throw new SecurityException("Access denied — this farm does not belong to you");
        }
    }
}
