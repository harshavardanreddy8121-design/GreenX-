package com.greenx.farmapi.controller;

import com.greenx.farmapi.dto.ApiResponse;
import com.greenx.farmapi.service.AiService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * AI Controller — Generative AI endpoints for the GreenX farm platform.
 *
 * All endpoints are under /api/ai and require authentication (except /ai/status).
 * The service layer transparently uses GPT-4 when OPENAI_API_KEY is set,
 * otherwise falls back to the deterministic rule-based engine.
 */
@RestController
@RequestMapping("/ai")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AiController {

    private final AiService aiService;

    /**
     * POST /api/ai/analyze-farm
     * Comprehensive farm analysis — soil, crop health, alerts, recommendations.
     */
    @PostMapping("/analyze-farm")
    public ApiResponse<Map<String, Object>> analyzeFarm(@RequestBody Map<String, Object> farmData) {
        try {
            Map<String, Object> result = aiService.analyzeFarm(farmData);
            return ApiResponse.success(result);
        } catch (Exception e) {
            return ApiResponse.error("Farm analysis failed: " + e.getMessage());
        }
    }

    /**
     * POST /api/ai/crop-recommendation
     * Get AI-powered crop suggestions based on soil, season, and climate.
     *
     * Request body:
     * {
     *   "soilType": "LOAMY",
     *   "ph": 6.5,
     *   "season": "KHARIF",
     *   "rainfall": 800,
     *   "temperature": 28
     * }
     */
    @PostMapping("/crop-recommendation")
    public ApiResponse<Map<String, Object>> getCropRecommendation(@RequestBody Map<String, Object> input) {
        try {
            Map<String, Object> result = aiService.getCropRecommendations(input);
            return ApiResponse.success(result);
        } catch (Exception e) {
            return ApiResponse.error("Crop recommendation failed: " + e.getMessage());
        }
    }

    /**
     * POST /api/ai/pest-prediction
     * Predict pest and disease risks based on crop, weather, and conditions.
     *
     * Request body:
     * {
     *   "cropName": "rice",
     *   "temperature": 28,
     *   "humidity": 80,
     *   "rainfall": 50
     * }
     */
    @PostMapping("/pest-prediction")
    public ApiResponse<Map<String, Object>> predictPestRisk(@RequestBody Map<String, Object> input) {
        try {
            Map<String, Object> result = aiService.predictPestRisk(input);
            return ApiResponse.success(result);
        } catch (Exception e) {
            return ApiResponse.error("Pest prediction failed: " + e.getMessage());
        }
    }

    /**
     * POST /api/ai/resource-optimization
     * Optimize water, fertilizer, and labor usage for a farm.
     *
     * Request body:
     * {
     *   "cropName": "wheat",
     *   "soilMoisture": 25,
     *   "nitrogen": 120,
     *   "phosphorus": 15,
     *   "potassium": 180,
     *   "areaAcres": 5
     * }
     */
    @PostMapping("/resource-optimization")
    public ApiResponse<Map<String, Object>> optimizeResources(@RequestBody Map<String, Object> input) {
        try {
            Map<String, Object> result = aiService.optimizeResources(input);
            return ApiResponse.success(result);
        } catch (Exception e) {
            return ApiResponse.error("Resource optimization failed: " + e.getMessage());
        }
    }

    /**
     * POST /api/ai/ask
     * Multi-turn conversational AI — ask any agricultural question.
     * Maintains conversation history via sessionId for context-aware responses.
     *
     * Request body:
     * {
     *   "question": "What fertilizer should I use for rice?",
     *   "sessionId": "optional-session-uuid",
     *   "userId": "user-id",
     *   "farmId": "farm-id"
     * }
     */
    @PostMapping("/ask")
    public ApiResponse<Map<String, Object>> ask(@RequestBody Map<String, Object> request) {
        try {
            String question = (String) request.get("question");
            if (question == null || question.isBlank()) {
                return ApiResponse.error("Question is required");
            }
            String sessionId = (String) request.get("sessionId");
            String userId = (String) request.get("userId");
            String farmId = (String) request.get("farmId");

            Map<String, Object> result = aiService.ask(question, sessionId, userId, farmId);
            return ApiResponse.success(result);
        } catch (Exception e) {
            return ApiResponse.error("AI query failed: " + e.getMessage());
        }
    }

    /**
     * GET /api/ai/insights
     * Get active AI insights for a farm or user.
     *
     * Query params: farmId, userId
     */
    @GetMapping("/insights")
    public ApiResponse<List<Map<String, Object>>> getInsights(
            @RequestParam(required = false) String farmId,
            @RequestParam(required = false) String userId) {
        try {
            List<Map<String, Object>> insights = aiService.getInsights(farmId, userId);
            return ApiResponse.success(insights);
        } catch (Exception e) {
            return ApiResponse.error("Failed to fetch insights: " + e.getMessage());
        }
    }

    /**
     * POST /api/ai/generate-report
     * Generate a comprehensive AI-powered farm management report.
     */
    @PostMapping("/generate-report")
    public ApiResponse<Map<String, Object>> generateReport(@RequestBody Map<String, Object> farmData) {
        try {
            Map<String, Object> report = aiService.generateReport(farmData);
            return ApiResponse.success(report);
        } catch (Exception e) {
            return ApiResponse.error("Report generation failed: " + e.getMessage());
        }
    }

    /**
     * GET /api/ai/conversation/{sessionId}
     * Retrieve conversation history for a session.
     */
    @GetMapping("/conversation/{sessionId}")
    public ApiResponse<List<Map<String, Object>>> getConversation(@PathVariable String sessionId) {
        try {
            List<Map<String, Object>> history = aiService.getConversationHistory(sessionId);
            return ApiResponse.success(history);
        } catch (Exception e) {
            return ApiResponse.error("Failed to fetch conversation: " + e.getMessage());
        }
    }

    /**
     * GET /api/ai/status
     * Check AI service status and capabilities.
     */
    @GetMapping("/status")
    public ApiResponse<Map<String, Object>> getStatus() {
        Map<String, Object> status = Map.of(
                "service", "GreenX AI",
                "version", "2.0.0",
                "status", "active",
                "capabilities", List.of(
                        "farm-analysis",
                        "crop-recommendation",
                        "pest-prediction",
                        "resource-optimization",
                        "conversational-ai",
                        "autonomous-insights",
                        "report-generation"
                ),
                "knowledgeBase", Map.of(
                        "crops", 15,
                        "pests", 6,
                        "diseases", 5,
                        "soilTypes", 7
                )
        );
        return ApiResponse.success(status);
    }
}
