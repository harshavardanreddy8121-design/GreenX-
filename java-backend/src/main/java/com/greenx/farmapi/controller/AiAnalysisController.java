package com.greenx.farmapi.controller;

import com.greenx.farmapi.dto.ApiResponse;
import com.greenx.farmapi.service.AIAgentService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.List;

/**
 * AI Analysis Controller
 * Exposes AI agent endpoints for crop health analysis, alerts, and
 * recommendations
 */
@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AiAnalysisController {

    private final AIAgentService aiAgentService;

    /**
     * Analyze farm data and generate comprehensive report
     * POST /api/ai/analyze
     */
    @PostMapping("/analyze")
    public ApiResponse<Map<String, Object>> analyzeFarm(@RequestBody Map<String, Object> farmData) {
        try {
            Map<String, Object> analysis = aiAgentService.analyzeFarm(farmData);
            return ApiResponse.success(analysis);
        } catch (Exception e) {
            return ApiResponse.error("Failed to analyze farm: " + e.getMessage());
        }
    }

    /**
     * Get crop health status
     * POST /api/ai/health
     */
    @PostMapping("/health")
    public ApiResponse<Map<String, Object>> getCropHealth(@RequestBody Map<String, Object> farmData) {
        try {
            Map<String, Object> health = aiAgentService.getCropHealthStatus(farmData);
            return ApiResponse.success(health);
        } catch (Exception e) {
            return ApiResponse.error("Failed to get crop health: " + e.getMessage());
        }
    }

    /**
     * Get alerts for farm
     * POST /api/ai/alerts
     */
    @PostMapping("/alerts")
    public ApiResponse<List<Map<String, Object>>> getFarmAlerts(@RequestBody Map<String, Object> farmData) {
        try {
            List<Map<String, Object>> alerts = aiAgentService.getFarmAlerts(farmData);
            return ApiResponse.success(alerts);
        } catch (Exception e) {
            return ApiResponse.error("Failed to get alerts: " + e.getMessage());
        }
    }

    /**
     * Health check endpoint
     */
    @GetMapping("/health")
    public ApiResponse<Map<String, String>> health() {
        Map<String, String> status = Map.of(
                "status", "active",
                "service", "AI Agent Service",
                "version", "1.0.0");
        return ApiResponse.success(status);
    }
}
