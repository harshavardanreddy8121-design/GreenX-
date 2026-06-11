package com.greenx.farmapi.controller;

import com.greenx.farmapi.dto.ApiResponse;
import com.greenx.farmapi.service.AIAgentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.List;

/**
 * AI Analysis Controller
 * Exposes AI agent endpoints for crop health analysis, alerts, and
 * recommendations.
 *
 * Mapped to /ai/agent/** (context path /api → full prefix /api/ai/agent)
 * to avoid ambiguous handler conflicts with AiController which owns /ai/**.
 */
@RestController
@RequestMapping("/ai/agent")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class AiAnalysisController {

    private final AIAgentService aiAgentService;

    /**
     * Analyze farm data and generate comprehensive report
     * POST /api/ai/agent/analyze
     */
    @PostMapping("/analyze")
    public ApiResponse<Map<String, Object>> analyzeFarm(@RequestBody Map<String, Object> farmData) {
        log.info("[AiAnalysisController] POST /ai/agent/analyze called");
        try {
            Map<String, Object> analysis = aiAgentService.analyzeFarm(farmData);
            return ApiResponse.success(analysis);
        } catch (Exception e) {
            log.error("[AiAnalysisController] analyzeFarm error: {}", e.getMessage());
            return ApiResponse.error("Failed to analyze farm: " + e.getMessage());
        }
    }

    /**
     * Get crop health status
     * POST /api/ai/agent/crop-health
     */
    @PostMapping("/crop-health")
    public ApiResponse<Map<String, Object>> getCropHealth(@RequestBody Map<String, Object> farmData) {
        log.info("[AiAnalysisController] POST /ai/agent/crop-health called");
        try {
            Map<String, Object> health = aiAgentService.getCropHealthStatus(farmData);
            return ApiResponse.success(health);
        } catch (Exception e) {
            log.error("[AiAnalysisController] getCropHealth error: {}", e.getMessage());
            return ApiResponse.error("Failed to get crop health: " + e.getMessage());
        }
    }

    /**
     * Get alerts for farm
     * POST /api/ai/agent/alerts
     */
    @PostMapping("/alerts")
    public ApiResponse<List<Map<String, Object>>> getFarmAlerts(@RequestBody Map<String, Object> farmData) {
        log.info("[AiAnalysisController] POST /ai/agent/alerts called");
        try {
            List<Map<String, Object>> alerts = aiAgentService.getFarmAlerts(farmData);
            return ApiResponse.success(alerts);
        } catch (Exception e) {
            log.error("[AiAnalysisController] getFarmAlerts error: {}", e.getMessage());
            return ApiResponse.error("Failed to get alerts: " + e.getMessage());
        }
    }
}
