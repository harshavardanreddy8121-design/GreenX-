package com.greenx.farmapi.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

/**
 * AI Agent Service for analyzing farm data and providing insights
 * Handles crop health analysis, alerts, and recommendations
 */
@Service
@RequiredArgsConstructor
public class AIAgentService {

    private final CropHealthAnalyzer healthAnalyzer;
    private final AlertService alertService;

    /**
     * Generate comprehensive farm analysis
     */
    public Map<String, Object> analyzeFarm(Map<String, Object> farmData) {
        Map<String, Object> analysis = new HashMap<>();

        // Analyze crop health
        Map<String, Object> healthAnalysis = healthAnalyzer.analyzeHealth(farmData);
        analysis.put("health", healthAnalysis);

        // Generate alerts
        List<Map<String, Object>> alerts = alertService.generateAlerts(farmData, healthAnalysis);
        analysis.put("alerts", alerts);

        // Generate recommendations
        List<String> recommendations = generateRecommendations(farmData, healthAnalysis, alerts);
        analysis.put("recommendations", recommendations);

        // Summary
        Map<String, Object> summary = new HashMap<>();
        summary.put("overallHealth", healthAnalysis.get("overallScore"));
        summary.put("riskLevel", calculateRiskLevel(healthAnalysis));
        summary.put("lastAnalyzed", LocalDateTime.now());
        summary.put("actionRequired", !alerts.isEmpty());
        analysis.put("summary", summary);

        return analysis;
    }

    /**
     * Get real-time crop health status
     */
    public Map<String, Object> getCropHealthStatus(Map<String, Object> farmData) {
        return healthAnalyzer.analyzeHealth(farmData);
    }

    /**
     * Get current alerts for farm
     */
    public List<Map<String, Object>> getFarmAlerts(Map<String, Object> farmData) {
        return alertService.generateAlerts(farmData, healthAnalyzer.analyzeHealth(farmData));
    }

    /**
     * Generate AI-powered recommendations
     */
    private List<String> generateRecommendations(
            Map<String, Object> farmData,
            Map<String, Object> healthAnalysis,
            List<Map<String, Object>> alerts) {

        List<String> recommendations = new ArrayList<>();

        // Soil analysis recommendations
        Double soilPh = ((Number) farmData.getOrDefault("soil_ph", 7.0)).doubleValue();
        if (soilPh < 6.0) {
            recommendations
                    .add("🔴 Soil is too acidic (pH " + String.format("%.1f", soilPh) + "). Apply lime to raise pH.");
        } else if (soilPh > 8.0) {
            recommendations
                    .add("🔴 Soil is too alkaline (pH " + String.format("%.1f", soilPh) + "). Use sulfur to lower pH.");
        }

        // Nitrogen recommendations
        Double nitrogen = ((Number) farmData.getOrDefault("soil_nitrogen", 0)).doubleValue();
        if (nitrogen < 100) {
            recommendations.add("⚠️ Low nitrogen levels. Apply nitrogen-rich fertilizer immediately.");
        } else if (nitrogen > 400) {
            recommendations.add("⚠️ High nitrogen levels. Reduce fertilizer application to avoid runoff.");
        }

        // Phosphorus recommendations
        Double phosphorus = ((Number) farmData.getOrDefault("soil_phosphorus", 0)).doubleValue();
        if (phosphorus < 15) {
            recommendations.add("⚠️ Low phosphorus. Apply phosphate fertilizer for root development.");
        }

        // Potassium recommendations
        Double potassium = ((Number) farmData.getOrDefault("soil_potassium", 0)).doubleValue();
        if (potassium < 150) {
            recommendations.add("⚠️ Low potassium. Apply potassium fertilizer for crop strength.");
        }

        // Moisture recommendations
        Double moisture = ((Number) farmData.getOrDefault("soil_moisture", 0)).doubleValue();
        if (moisture < 20) {
            recommendations.add("💧 Soil moisture is low. Increase irrigation frequency.");
        } else if (moisture > 60) {
            recommendations.add("💧 Soil moisture is high. Check drainage and reduce watering.");
        }

        // Organic carbon recommendations
        Double organicCarbon = ((Number) farmData.getOrDefault("soil_organic_carbon", 0)).doubleValue();
        if (organicCarbon < 0.5) {
            recommendations.add("🌾 Low organic matter. Add compost or manure to improve soil health.");
        }

        // Based on health score
        int healthScore = ((Number) healthAnalysis.getOrDefault("overallScore", 50)).intValue();
        if (healthScore > 80) {
            recommendations.add("✅ Farm conditions are excellent. Continue current practices.");
        } else if (healthScore < 40) {
            recommendations.add("🚨 Critical action needed. Multiple parameters are out of optimal range.");
        }

        // Alert-based recommendations
        for (Map<String, Object> alert : alerts) {
            String severity = (String) alert.get("severity");
            String type = (String) alert.get("type");

            if ("pest".equals(type) && "high".equals(severity)) {
                recommendations.add("🐛 Pest infestation detected. Apply appropriate pesticide immediately.");
            }
            if ("disease".equals(type) && "high".equals(severity)) {
                recommendations.add("🦠 Disease risk high. Apply fungicide and improve ventilation.");
            }
        }

        return recommendations;
    }

    /**
     * Calculate overall risk level
     */
    private String calculateRiskLevel(Map<String, Object> healthAnalysis) {
        int score = ((Number) healthAnalysis.getOrDefault("overallScore", 50)).intValue();
        if (score >= 80)
            return "low";
        if (score >= 60)
            return "medium";
        if (score >= 40)
            return "high";
        return "critical";
    }
}
