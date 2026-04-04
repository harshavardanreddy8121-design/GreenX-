package com.greenx.farmapi.service;

import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.*;

/**
 * Alert Service for generating farm alerts based on data analysis
 * Monitors thresholds and generates actionable alerts
 */
@Service
public class AlertService {

    /**
     * Generate alerts based on farm data and health analysis
     */
    public List<Map<String, Object>> generateAlerts(
            Map<String, Object> farmData,
            Map<String, Object> healthAnalysis) {

        List<Map<String, Object>> alerts = new ArrayList<>();

        // Check soil pH
        alerts.addAll(checkSoilPH(farmData));

        // Check nutrients
        alerts.addAll(checkNutrients(farmData));

        // Check moisture
        alerts.addAll(checkMoisture(farmData));

        // Check organic carbon
        alerts.addAll(checkOrganicCarbon(farmData));

        // Check disease risk
        alerts.addAll(checkDiseaseRisk(farmData));

        // Check overall health
        alerts.addAll(checkOverallHealth(healthAnalysis));

        // Sort by severity (high -> medium -> low)
        alerts.sort((a, b) -> {
            String aSev = (String) a.get("severity");
            String bSev = (String) b.get("severity");
            return getSeverityLevel(bSev) - getSeverityLevel(aSev);
        });

        return alerts;
    }

    /**
     * Check soil pH and generate alerts
     */
    private List<Map<String, Object>> checkSoilPH(Map<String, Object> farmData) {
        List<Map<String, Object>> alerts = new ArrayList<>();
        Double ph = ((Number) farmData.getOrDefault("soil_ph", 7.0)).doubleValue();

        if (ph < 5.5) {
            alerts.add(createAlert(
                    "pH Too Low (Acidic)",
                    "Soil pH is " + String.format("%.1f", ph) + " - very acidic. Apply limestone to raise pH.",
                    "soil",
                    "high"));
        } else if (ph < 6.0) {
            alerts.add(createAlert(
                    "Slightly Acidic Soil",
                    "Soil pH is " + String.format("%.1f", ph) + " - moderately acidic. Consider adding lime.",
                    "soil",
                    "medium"));
        } else if (ph > 8.5) {
            alerts.add(createAlert(
                    "pH Too High (Alkaline)",
                    "Soil pH is " + String.format("%.1f", ph) + " - too alkaline. Apply sulfur to lower pH.",
                    "soil",
                    "high"));
        } else if (ph > 8.0) {
            alerts.add(createAlert(
                    "Slightly Alkaline Soil",
                    "Soil pH is " + String.format("%.1f", ph) + " - moderately alkaline. Monitor and adjust if needed.",
                    "soil",
                    "medium"));
        }

        return alerts;
    }

    /**
     * Check nutrient levels and generate alerts
     */
    private List<Map<String, Object>> checkNutrients(Map<String, Object> farmData) {
        List<Map<String, Object>> alerts = new ArrayList<>();

        // Nitrogen check
        Double nitrogen = ((Number) farmData.getOrDefault("soil_nitrogen", 150)).doubleValue();
        if (nitrogen < 80) {
            alerts.add(createAlert(
                    "Severe Nitrogen Deficiency",
                    "Nitrogen level (" + nitrogen.intValue()
                            + " ppm) is critically low. Apply nitrogen fertilizer immediately.",
                    "nutrient",
                    "high"));
        } else if (nitrogen < 120) {
            alerts.add(createAlert(
                    "Low Nitrogen",
                    "Nitrogen level (" + nitrogen.intValue()
                            + " ppm) is below optimal. Apply nitrogen-rich fertilizer.",
                    "nutrient",
                    "medium"));
        } else if (nitrogen > 400) {
            alerts.add(createAlert(
                    "Excess Nitrogen",
                    "Nitrogen level (" + nitrogen.intValue() + " ppm) is too high. Reduce fertilizer application.",
                    "nutrient",
                    "medium"));
        }

        // Phosphorus check
        Double phosphorus = ((Number) farmData.getOrDefault("soil_phosphorus", 20)).doubleValue();
        if (phosphorus < 10) {
            alerts.add(createAlert(
                    "Severe Phosphorus Deficiency",
                    "Phosphorus level (" + phosphorus.intValue()
                            + " ppm) is critically low. Apply phosphate fertilizer.",
                    "nutrient",
                    "high"));
        } else if (phosphorus < 15) {
            alerts.add(createAlert(
                    "Low Phosphorus",
                    "Phosphorus level (" + phosphorus.intValue()
                            + " ppm) is below optimal. Apply phosphate fertilizer.",
                    "nutrient",
                    "medium"));
        }

        // Potassium check
        Double potassium = ((Number) farmData.getOrDefault("soil_potassium", 200)).doubleValue();
        if (potassium < 100) {
            alerts.add(createAlert(
                    "Severe Potassium Deficiency",
                    "Potassium level (" + potassium.intValue()
                            + " ppm) is critically low. Apply potassium fertilizer immediately.",
                    "nutrient",
                    "high"));
        } else if (potassium < 150) {
            alerts.add(createAlert(
                    "Low Potassium",
                    "Potassium level (" + potassium.intValue() + " ppm) is below optimal. Apply potassium fertilizer.",
                    "nutrient",
                    "medium"));
        }

        return alerts;
    }

    /**
     * Check soil moisture and generate alerts
     */
    private List<Map<String, Object>> checkMoisture(Map<String, Object> farmData) {
        List<Map<String, Object>> alerts = new ArrayList<>();
        Double moisture = ((Number) farmData.getOrDefault("soil_moisture", 30)).doubleValue();

        if (moisture < 15) {
            alerts.add(createAlert(
                    "Severe Drought Stress",
                    "Soil moisture is " + String.format("%.0f", moisture)
                            + "% - critically low. Increase irrigation immediately.",
                    "moisture",
                    "high"));
        } else if (moisture < 20) {
            alerts.add(createAlert(
                    "Dry Soil",
                    "Soil moisture is " + String.format("%.0f", moisture) + "% - below optimal. Increase watering.",
                    "moisture",
                    "medium"));
        } else if (moisture > 55) {
            alerts.add(createAlert(
                    "Waterlogging Risk",
                    "Soil moisture is " + String.format("%.0f", moisture)
                            + "% - too high. Check drainage and reduce watering to prevent root rot.",
                    "moisture",
                    "high"));
        } else if (moisture > 50) {
            alerts.add(createAlert(
                    "High Soil Moisture",
                    "Soil moisture is " + String.format("%.0f", moisture)
                            + "% - above optimal. Reduce watering frequency.",
                    "moisture",
                    "medium"));
        }

        return alerts;
    }

    /**
     * Check organic carbon levels
     */
    private List<Map<String, Object>> checkOrganicCarbon(Map<String, Object> farmData) {
        List<Map<String, Object>> alerts = new ArrayList<>();
        Double carbon = ((Number) farmData.getOrDefault("soil_organic_carbon", 0.5)).doubleValue();

        if (carbon < 0.3) {
            alerts.add(createAlert(
                    "Very Low Organic Matter",
                    "Organic carbon is " + String.format("%.2f", carbon)
                            + "% - critically low. Add compost, manure, or crop residue.",
                    "soil",
                    "high"));
        } else if (carbon < 0.5) {
            alerts.add(createAlert(
                    "Low Organic Matter",
                    "Organic carbon is " + String.format("%.2f", carbon)
                            + "% - below optimal. Increase organic amendments.",
                    "soil",
                    "medium"));
        }

        return alerts;
    }

    /**
     * Check disease and pest risks
     */
    private List<Map<String, Object>> checkDiseaseRisk(Map<String, Object> farmData) {
        List<Map<String, Object>> alerts = new ArrayList<>();

        String diseaseRisk = (String) farmData.getOrDefault("disease_risk", "low");
        String pestRisk = (String) farmData.getOrDefault("pest_risk", "low");

        if ("high".equalsIgnoreCase(diseaseRisk)) {
            alerts.add(createAlert(
                    "High Disease Risk",
                    "Disease risk is HIGH. Implement preventive measures: improve ventilation, avoid overhead irrigation, apply fungicide if needed.",
                    "disease",
                    "high"));
        } else if ("medium".equalsIgnoreCase(diseaseRisk)) {
            alerts.add(createAlert(
                    "Moderate Disease Risk",
                    "Disease risk is MEDIUM. Monitor crops closely and prepare treatment options.",
                    "disease",
                    "medium"));
        }

        if ("high".equalsIgnoreCase(pestRisk)) {
            alerts.add(createAlert(
                    "High Pest Infestation Risk",
                    "Pest risk is HIGH. Scout fields regularly and apply appropriate pest control measures.",
                    "pest",
                    "high"));
        } else if ("medium".equalsIgnoreCase(pestRisk)) {
            alerts.add(createAlert(
                    "Moderate Pest Risk",
                    "Pest risk is MEDIUM. Monitor for pest signs and maintain preventive practices.",
                    "pest",
                    "medium"));
        }

        return alerts;
    }

    /**
     * Check overall crop health
     */
    private List<Map<String, Object>> checkOverallHealth(Map<String, Object> healthAnalysis) {
        List<Map<String, Object>> alerts = new ArrayList<>();

        int overallScore = ((Number) healthAnalysis.getOrDefault("overallScore", 50)).intValue();
        String status = (String) healthAnalysis.getOrDefault("status", "Fair");

        if (overallScore < 40) {
            alerts.add(createAlert(
                    "Critical Crop Health",
                    "Overall crop health is CRITICAL (" + overallScore + "/100). Immediate intervention required.",
                    "health",
                    "high"));
        } else if (overallScore < 60) {
            alerts.add(createAlert(
                    "Poor Crop Health",
                    "Overall crop health is POOR (" + overallScore + "/100). Multiple issues need attention.",
                    "health",
                    "medium"));
        }

        return alerts;
    }

    /**
     * Create an alert object
     */
    private Map<String, Object> createAlert(String title, String message, String type, String severity) {
        Map<String, Object> alert = new HashMap<>();
        alert.put("id", UUID.randomUUID().toString());
        alert.put("title", title);
        alert.put("message", message);
        alert.put("type", type);
        alert.put("severity", severity);
        alert.put("timestamp", LocalDateTime.now());
        alert.put("read", false);
        return alert;
    }

    /**
     * Get severity level for sorting (0=low, 1=medium, 2=high)
     */
    private int getSeverityLevel(String severity) {
        if ("high".equalsIgnoreCase(severity))
            return 3;
        if ("medium".equalsIgnoreCase(severity))
            return 2;
        return 1;
    }
}
