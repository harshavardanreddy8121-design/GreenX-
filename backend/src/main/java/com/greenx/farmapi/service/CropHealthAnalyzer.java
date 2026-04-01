package com.greenx.farmapi.service;

import com.greenx.farmapi.ai.knowledge.*;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * AI-Powered Crop Health Analyzer
 * Uses comprehensive agricultural knowledge bases to analyze crop health
 * Integrates soil science, agronomy, pathology, and weather data
 */
@Service
public class CropHealthAnalyzer {

    /**
     * Comprehensive crop health analysis using AI knowledge bases
     */
    public Map<String, Object> analyzeHealth(Map<String, Object> farmData) {
        Map<String, Object> healthAnalysis = new HashMap<>();

        // Calculate individual component scores (0-100)
        int soilScore = calculateSoilScore(farmData);
        int nutrientScore = calculateNutrientScore(farmData);
        int moistureScore = calculateMoistureScore(farmData);
        int stemAndRootScore = calculateStemAndRootScore(farmData);
        int diseaseScore = calculateDiseaseScore(farmData);

        // Calculate weighted overall score
        int overallScore = (int) ((soilScore * 0.20 +
                nutrientScore * 0.25 +
                moistureScore * 0.20 +
                stemAndRootScore * 0.20 +
                diseaseScore * 0.15));

        healthAnalysis.put("overallScore", Math.min(100, Math.max(0, overallScore)));
        healthAnalysis.put("soilScore", soilScore);
        healthAnalysis.put("nutrientScore", nutrientScore);
        healthAnalysis.put("moistureScore", moistureScore);
        healthAnalysis.put("stemAndRootScore", stemAndRootScore);
        healthAnalysis.put("diseaseScore", diseaseScore);

        // Status indicators
        healthAnalysis.put("status", getHealthStatus(overallScore));
        healthAnalysis.put("color", getHealthColor(overallScore));

        // Detailed metrics
        Map<String, Object> metrics = new HashMap<>();
        metrics.put("soilHealth", buildMetricDetails("Soil Health", soilScore, farmData));
        metrics.put("nutrients", buildMetricDetails("Nutrient Balance", nutrientScore, farmData));
        metrics.put("moisture", buildMetricDetails("Soil Moisture", moistureScore, farmData));
        metrics.put("stemAndRoot", buildMetricDetails("Stem & Root Health", stemAndRootScore, farmData));
        metrics.put("disease", buildMetricDetails("Disease Resistance", diseaseScore, farmData));

        healthAnalysis.put("metrics", metrics);
        
        // Add AI-powered recommendations from knowledge bases
        healthAnalysis.put("soilRecommendations", generateSoilRecommendations(farmData));
        healthAnalysis.put("cropRecommendations", generateCropRecommendations(farmData));
        healthAnalysis.put("pestDiseaseAlerts", generatePestDiseaseAlerts(farmData));
        healthAnalysis.put("weatherAlerts", generateWeatherAlerts(farmData));
        healthAnalysis.put("harvestGuidance", generateHarvestGuidance(farmData));

        return healthAnalysis;
    }
    
    /**
     * Generate soil-specific recommendations using AI knowledge
     */
    private List<String> generateSoilRecommendations(Map<String, Object> farmData) {
        List<String> recommendations = new ArrayList<>();
        
        Double ph = ((Number) farmData.getOrDefault("soil_ph", 7.0)).doubleValue();
        Double nitrogen = ((Number) farmData.getOrDefault("soil_nitrogen", 150)).doubleValue();
        Double phosphorus = ((Number) farmData.getOrDefault("soil_phosphorus", 20)).doubleValue();
        Double potassium = ((Number) farmData.getOrDefault("soil_potassium", 200)).doubleValue();
        Double organicCarbon = ((Number) farmData.getOrDefault("soil_organic_carbon", 0.5)).doubleValue();
        Double moisture = ((Number) farmData.getOrDefault("soil_moisture", 30)).doubleValue();
        
        // Use AI knowledge bases
        recommendations.addAll(SoilAnalysisKnowledge.analyzePH(ph));
        recommendations.addAll(SoilAnalysisKnowledge.analyzeNitrogen(nitrogen));
        recommendations.addAll(SoilAnalysisKnowledge.analyzePhosphorus(phosphorus));
        recommendations.addAll(SoilAnalysisKnowledge.analyzePotassium(potassium));
        recommendations.addAll(SoilAnalysisKnowledge.analyzeOrganicCarbon(organicCarbon));
        recommendations.addAll(SoilAnalysisKnowledge.analyzeMoisture(moisture));
        
        // EC analysis if available
        if (farmData.containsKey("electrical_conductivity")) {
            Double ec = ((Number) farmData.get("electrical_conductivity")).doubleValue();
            recommendations.addAll(SoilAnalysisKnowledge.analyzeEC(ec));
        }
        
        return recommendations;
    }
    
    /**
     * Generate crop selection recommendations
     */
    private List<String> generateCropRecommendations(Map<String, Object> farmData) {
        List<String> recommendations = new ArrayList<>();
        
        try {
            String soilTypeStr = (String) farmData.getOrDefault("soil_type", "LOAMY");
            SoilAnalysisKnowledge.SoilType soilType = SoilAnalysisKnowledge.SoilType.valueOf(soilTypeStr.toUpperCase());
            Double ph = ((Number) farmData.getOrDefault("soil_ph", 7.0)).doubleValue();
            
            // Get season if available
            String seasonStr = (String) farmData.getOrDefault("season", "KHARIF");
            CropKnowledge.Season season = CropKnowledge.Season.valueOf(seasonStr.toUpperCase());
            
            Double rainfall = ((Number) farmData.getOrDefault("rainfall", 800)).doubleValue();
            Double temperature = ((Number) farmData.getOrDefault("temperature", 25)).doubleValue();
            
            // Get AI crop recommendations
            List<String> cropRecs = CropKnowledge.recommendCrops(soilType, ph, season, rainfall, temperature);
            recommendations.add("=== RECOMMENDED CROPS FOR YOUR LAND ===");
            recommendations.addAll(cropRecs);
            
            // Add soil type info
            Map<String, Object> soilInfo = SoilAnalysisKnowledge.getSoilTypeInfo(soilType);
            recommendations.add("\n=== YOUR SOIL TYPE: " + soilType + " ===");
            recommendations.add("Water Holding: " + soilInfo.get("waterHolding"));
            recommendations.add("Drainage: " + soilInfo.get("drainage"));
            recommendations.add("Fertility: " + soilInfo.get("fertility"));
            
        } catch (Exception e) {
            recommendations.add("Unable to generate crop recommendations - data incomplete");
        }
        
        return recommendations;
    }
    
    /**
     * Generate pest and disease alerts
     */
    private List<String> generatePestDiseaseAlerts(Map<String, Object> farmData) {
        List<String> alerts = new ArrayList<>();
        
        String cropName = (String) farmData.getOrDefault("crop_type", "rice");
        
        // Get common pests for this crop
        List<String> commonPests = PestDiseaseKnowledge.getCropPests(cropName.toLowerCase());
        if (!commonPests.isEmpty()) {
            alerts.add("=== COMMON PESTS & DISEASES FOR " + cropName.toUpperCase() + " ===");
            alerts.addAll(commonPests);
            alerts.add("\nMONITOR REGULARLY FOR EARLY DETECTION");
        }
        
        // Disease risk based on weather
        if (farmData.containsKey("temperature") && farmData.containsKey("humidity")) {
            Double temp = ((Number) farmData.get("temperature")).doubleValue();
            Double humidity = ((Number) farmData.getOrDefault("humidity", 70)).doubleValue();
            Double rainfall = ((Number) farmData.getOrDefault("rainfall", 50)).doubleValue();
            
            alerts.add("\n=== WEATHER-BASED DISEASE RISK ===");
            alerts.addAll(GrowthMonitoringKnowledge.assessDiseaseRisk(temp, humidity, rainfall));
        }
        
        return alerts;
    }
    
    /**
     * Generate weather-based alerts
     */
    private List<String> generateWeatherAlerts(Map<String, Object> farmData) {
        List<String> alerts = new ArrayList<>();
        
        Double moisture = ((Number) farmData.getOrDefault("soil_moisture", 30)).doubleValue();
        Double rainfall = ((Number) farmData.getOrDefault("rainfall", 0)).doubleValue();
        Double temperature = ((Number) farmData.getOrDefault("temperature", 25)).doubleValue();
        
        // Water stress analysis
        alerts.add("=== WATER STATUS ===");
        alerts.addAll(GrowthMonitoringKnowledge.analyzeWaterStress(moisture, rainfall, temperature));
        
        // Temperature stress if crop data available
        String cropName = (String) farmData.getOrDefault("crop_type", "rice");
        CropKnowledge.CropData cropData = CropKnowledge.getCropData(cropName.toLowerCase());
        if (cropData != null) {
            alerts.add("\n=== TEMPERATURE STATUS ===");
            alerts.addAll(GrowthMonitoringKnowledge.analyzeTemperatureStress(
                temperature, cropData.minTemp, cropData.maxTemp, cropName));
        }
        
        return alerts;
    }
    
    /**
     * Generate harvest guidance
     */
    private List<String> generateHarvestGuidance(Map<String, Object> farmData) {
        List<String> guidance = new ArrayList<>();
        
        try {
            String cropName = (String) farmData.getOrDefault("crop_type", "rice");
            Integer daysAfterPlanting = ((Number) farmData.getOrDefault("days_after_planting", 0)).intValue();
            
            CropKnowledge.CropData cropData = CropKnowledge.getCropData(cropName.toLowerCase());
            if (cropData != null && daysAfterPlanting > 0) {
                guidance.addAll(GrowthMonitoringKnowledge.assessHarvestReadiness(
                    daysAfterPlanting, cropData.durationDays, cropName));
                
                // Add growth stage info
                guidance.add("\n=== GROWTH STAGES FOR " + cropName.toUpperCase() + " ===");
                for (Map.Entry<String, String> stage : cropData.growthStages.entrySet()) {
                    guidance.add(stage.getKey() + ": " + stage.getValue());
                }
            }
            
            // Market price guidance if available
            if (farmData.containsKey("current_market_price")) {
                Double currentPrice = ((Number) farmData.get("current_market_price")).doubleValue();
                Double avgPrice = ((Number) farmData.getOrDefault("average_market_price", currentPrice)).doubleValue();
                Double highPrice = ((Number) farmData.getOrDefault("historic_high_price", currentPrice * 1.2)).doubleValue();
                
                guidance.add("\n=== MARKET INTELLIGENCE ===");
                guidance.addAll(GrowthMonitoringKnowledge.marketPriceRecommendation(
                    currentPrice, avgPrice, highPrice));
            }
            
        } catch (Exception e) {
            guidance.add("Harvest guidance unavailable - insufficient data");
        }
        
        return guidance;
    }

    /**
     * Assess soil quality (pH, organic content)
     */
    private int calculateSoilScore(Map<String, Object> farmData) {
        int score = 70; // baseline

        Double ph = ((Number) farmData.getOrDefault("soil_ph", 7.0)).doubleValue();
        Double organicCarbon = ((Number) farmData.getOrDefault("soil_organic_carbon", 0.5)).doubleValue();

        // pH scoring (optimal 6.0-7.5)
        if (ph >= 6.0 && ph <= 7.5) {
            score += 15;
        } else if (ph >= 5.5 && ph <= 8.0) {
            score += 10;
        } else if (ph >= 5.0 && ph <= 8.5) {
            score += 5;
        } else {
            score -= 10;
        }

        // Organic carbon scoring (optimal > 1.0%)
        if (organicCarbon > 1.0) {
            score += 10;
        } else if (organicCarbon > 0.7) {
            score += 5;
        } else {
            score -= 5;
        }

        return Math.min(100, Math.max(0, score));
    }

    /**
     * Assess nutrient levels (N, P, K)
     */
    private int calculateNutrientScore(Map<String, Object> farmData) {
        int score = 60;

        Double nitrogen = ((Number) farmData.getOrDefault("soil_nitrogen", 150)).doubleValue();
        Double phosphorus = ((Number) farmData.getOrDefault("soil_phosphorus", 20)).doubleValue();
        Double potassium = ((Number) farmData.getOrDefault("soil_potassium", 200)).doubleValue();

        // Nitrogen scoring (optimal 150-250)
        if (nitrogen >= 150 && nitrogen <= 250) {
            score += 20;
        } else if (nitrogen >= 100 && nitrogen <= 300) {
            score += 10;
        } else if (nitrogen < 100) {
            score -= 15;
        } else if (nitrogen > 400) {
            score -= 10;
        }

        // Phosphorus scoring (optimal 20-30)
        if (phosphorus >= 20 && phosphorus <= 30) {
            score += 15;
        } else if (phosphorus >= 15 && phosphorus <= 40) {
            score += 8;
        } else if (phosphorus < 15) {
            score -= 12;
        }

        // Potassium scoring (optimal 200-300)
        if (potassium >= 200 && potassium <= 300) {
            score += 15;
        } else if (potassium >= 150 && potassium <= 350) {
            score += 8;
        } else if (potassium < 150) {
            score -= 12;
        }

        return Math.min(100, Math.max(0, score));
    }

    /**
     * Assess soil moisture level
     */
    private int calculateMoistureScore(Map<String, Object> farmData) {
        Double moisture = ((Number) farmData.getOrDefault("soil_moisture", 30)).doubleValue();

        // Optimal moisture 25-40%
        if (moisture >= 25 && moisture <= 40) {
            return 95;
        } else if (moisture >= 20 && moisture <= 45) {
            return 85;
        } else if (moisture >= 15 && moisture <= 50) {
            return 70;
        } else if (moisture < 15) {
            return Math.max(10, (int) (50 - (15 - moisture) * 3));
        } else {
            return Math.max(10, (int) (70 - (moisture - 50) * 2));
        }
    }

    /**
     * Assess stem and root health potential
     */
    private int calculateStemAndRootScore(Map<String, Object> farmData) {
        int score = 70;

        Double nitrogen = ((Number) farmData.getOrDefault("soil_nitrogen", 150)).doubleValue();
        Double phosphorus = ((Number) farmData.getOrDefault("soil_phosphorus", 20)).doubleValue();
        Double potassium = ((Number) farmData.getOrDefault("soil_potassium", 200)).doubleValue();

        // High nitrogen promotes stem growth
        if (nitrogen >= 150 && nitrogen <= 250) {
            score += 10;
        }

        // Phosphorus essential for root development
        if (phosphorus >= 20 && phosphorus <= 30) {
            score += 15;
        }

        // Potassium for overall vigor
        if (potassium >= 200 && potassium <= 300) {
            score += 10;
        }

        return Math.min(100, Math.max(0, score));
    }

    /**
     * Assess disease risk based on environmental factors
     */
    private int calculateDiseaseScore(Map<String, Object> farmData) {
        int score = 85; // baseline (low primary disease risk)

        Double moisture = ((Number) farmData.getOrDefault("soil_moisture", 30)).doubleValue();

        // High moisture increases fungal disease risk
        if (moisture > 50) {
            score -= 25;
        } else if (moisture > 45) {
            score -= 15;
        } else if (moisture > 40) {
            score -= 8;
        }

        // Get pest/disease risk if available (from diagnostics or expert input)
        String pestRisk = (String) farmData.getOrDefault("pest_risk", "low");
        String diseaseRisk = (String) farmData.getOrDefault("disease_risk", "low");

        if ("high".equalsIgnoreCase(pestRisk)) {
            score -= 20;
        } else if ("medium".equalsIgnoreCase(pestRisk)) {
            score -= 10;
        }

        if ("high".equalsIgnoreCase(diseaseRisk)) {
            score -= 25;
        } else if ("medium".equalsIgnoreCase(diseaseRisk)) {
            score -= 12;
        }

        return Math.min(100, Math.max(0, score));
    }

    /**
     * Get human-readable health status
     */
    private String getHealthStatus(int score) {
        if (score >= 80)
            return "Excellent";
        if (score >= 60)
            return "Good";
        if (score >= 40)
            return "Fair";
        if (score >= 20)
            return "Poor";
        return "Critical";
    }

    /**
     * Get visual color indicator for health
     */
    private String getHealthColor(int score) {
        if (score >= 80)
            return "green";
        if (score >= 60)
            return "blue";
        if (score >= 40)
            return "yellow";
        if (score >= 20)
            return "orange";
        return "red";
    }

    /**
     * Build detailed metric information
     */
    private Map<String, Object> buildMetricDetails(String name, int score, Map<String, Object> farmData) {
        Map<String, Object> metric = new HashMap<>();
        metric.put("name", name);
        metric.put("score", score);
        metric.put("status", getHealthStatus(score));
        metric.put("color", getHealthColor(score));
        return metric;
    }
}
