package com.greenx.farmapi.ai.knowledge;

import java.util.*;

/**
 * Weather and Growth Monitoring Knowledge Base
 * Contains rules for weather impact and growth stage monitoring
 */
public class GrowthMonitoringKnowledge {

    public enum GrowthAlert {
        WATER_STRESS,
        NUTRIENT_DEFICIENCY,
        TEMPERATURE_STRESS,
        PEST_ATTACK,
        DISEASE_RISK,
        OPTIMAL_CONDITIONS,
        HARVEST_READY
    }

    /**
     * Analyze water stress based on soil moisture and weather
     */
    public static List<String> analyzeWaterStress(double soilMoisture, double rainfall, double temperature) {
        List<String> alerts = new ArrayList<>();

        if (soilMoisture < 20 && rainfall < 10) {
            alerts.add("CRITICAL: Severe water stress detected!");
            alerts.add("Soil moisture: " + soilMoisture + "% (Very low)");
            alerts.add("Rainfall: " + rainfall + " mm (Insufficient)");
            alerts.add("ACTION REQUIRED:");
            alerts.add("- Irrigate immediately (25-30 mm)");
            alerts.add("- Check irrigation system");
            alerts.add("- Apply mulch to conserve moisture");

            if (temperature > 35) {
                alerts.add("- High temperature (" + temperature + "°C) increasing evaporation");
                alerts.add("- Consider mist irrigation or shade nets");
            }
        } else if (soilMoisture < 30 && rainfall < 20) {
            alerts.add("WARNING: Water stress developing");
            alerts.add("Soil moisture: " + soilMoisture + "% (Low)");
            alerts.add("Schedule irrigation within 24-48 hours");
            alerts.add("Expected crop symptoms:");
            alerts.add("- Leaf wilting during afternoon");
            alerts.add("- Slow growth rate");
            alerts.add("- Leaf margin drying");
        } else if (soilMoisture > 70) {
            alerts.add("CAUTION: Excess moisture detected!");
            alerts.add("Soil moisture: " + soilMoisture + "% (Very high)");
            alerts.add("Risk of waterlogging and root diseases");
            alerts.add("ACTIONS:");
            alerts.add("- Ensure proper drainage");
            alerts.add("- Delay next irrigation");
            alerts.add("- Monitor for fungal diseases");
        } else {
            alerts.add("GOOD: Soil moisture is adequate (" + soilMoisture + "%)");
            alerts.add("Continue normal irrigation schedule");
        }

        return alerts;
    }

    /**
     * Detect nutrient deficiency symptoms
     */
    public static List<String> detectNutrientDeficiency(String symptomType) {
        List<String> diagnosis = new ArrayList<>();

        switch (symptomType.toLowerCase()) {
            case "yellowing_older_leaves":
            case "chlorosis_old_leaves":
                diagnosis.add("DIAGNOSIS: Nitrogen (N) Deficiency");
                diagnosis.add("Symptoms observed: Yellowing of older leaves first");
                diagnosis.add("Plant appears pale green");
                diagnosis.add("Stunted growth");
                diagnosis.add("\nIMMEDIATE ACTION:");
                diagnosis.add("- Apply urea @ 50-75 kg/ha as spray");
                diagnosis.add("- Foliar spray: 2% urea solution");
                diagnosis.add("- For organic: Apply well-decomposed FYM");
                diagnosis.add("- Response expected in 5-7 days");
                break;

            case "purpling_leaves":
            case "dark_green_leaves":
                diagnosis.add("DIAGNOSIS: Phosphorus (P) Deficiency");
                diagnosis.add("Symptoms: Purple or dark green color on leaves");
                diagnosis.add("Poor root development");
                diagnosis.add("Delayed maturity");
                diagnosis.add("\nIMMEDIATE ACTION:");
                diagnosis.add("- Apply DAP @ 50 kg/ha");
                diagnosis.add("- Foliar spray: 1% DAP solution");
                diagnosis.add("- Apply rock phosphate for long-term");
                diagnosis.add("- Ensure adequate moisture for P uptake");
                break;

            case "leaf_scorching":
            case "marginal_burn":
                diagnosis.add("DIAGNOSIS: Potassium (K) Deficiency");
                diagnosis.add("Symptoms: Leaf margins turning brown/yellow");
                diagnosis.add("Scorching of leaf tips");
                diagnosis.add("Weak stems, lodging");
                diagnosis.add("\nIMMEDIATE ACTION:");
                diagnosis.add("- Apply Muriate of Potash @ 25-40 kg/ha");
                diagnosis.add("- Foliar spray: 1% MOP solution");
                diagnosis.add("- For organic: Apply wood ash");
                diagnosis.add("- Splitting in 2-3 doses recommended");
                break;

            case "interveinal_chlorosis":
            case "yellowing_between_veins":
                diagnosis.add("DIAGNOSIS: Iron (Fe) or Magnesium (Mg) Deficiency");
                diagnosis.add("Symptoms: Yellowing between leaf veins");
                diagnosis.add("Veins remain green");
                diagnosis.add("\nIMMEDIATE ACTION:");
                diagnosis.add("- Spray ferrous sulfate (FeSO4) @ 0.5%");
                diagnosis.add("- For Mg: Apply magnesium sulfate @ 0.5%");
                diagnosis.add("- Check and correct soil pH");
                diagnosis.add("- Usually occurs in alkaline soils");
                break;

            case "stunted_growth":
            case "delayed_flowering":
                diagnosis.add("DIAGNOSIS: Multiple Nutrient Deficiency or Root Issues");
                diagnosis.add("Symptoms: Overall stunting, poor vigor");
                diagnosis.add("\nRECOMMENDED ACTIONS:");
                diagnosis.add("- Get soil tested immediately");
                diagnosis.add("- Apply balanced NPK fertilizer");
                diagnosis.add("- Check for root diseases or pests");
                diagnosis.add("- Improve organic matter content");
                break;

            default:
                diagnosis.add("Unable to diagnose from provided symptoms");
                diagnosis.add("Recommended: Send leaf samples to lab");
                diagnosis.add("Or consult with agronomist");
        }

        return diagnosis;
    }

    /**
     * Analyze temperature stress
     */
    public static List<String> analyzeTemperatureStress(double currentTemp, double minOptimal, double maxOptimal,
            String cropName) {
        List<String> alerts = new ArrayList<>();

        if (currentTemp < minOptimal - 5) {
            alerts.add("CRITICAL: Cold stress for " + cropName);
            alerts.add("Current temperature: " + currentTemp + "°C");
            alerts.add("Optimal range: " + minOptimal + "-" + maxOptimal + "°C");
            alerts.add("\nIMMEDIATE ACTIONS:");
            alerts.add("- Light irrigation to prevent frost damage");
            alerts.add("- Use smoke or mist to raise temperature");
            alerts.add("- Cover young plants if possible");
            alerts.add("- Delay transplanting/sowing");
            alerts.add("\nEXPECTED IMPACTS:");
            alerts.add("- Slow growth and development");
            alerts.add("- Flower drop possible");
            alerts.add("- Increased disease susceptibility");
        } else if (currentTemp < minOptimal) {
            alerts.add("WARNING: Temperature below optimal");
            alerts.add("Current: " + currentTemp + "°C, Optimal: " + minOptimal + "-" + maxOptimal + "°C");
            alerts.add("Growth rate will be slower");
            alerts.add("Monitor for frost in night");
        } else if (currentTemp > maxOptimal + 5) {
            alerts.add("CRITICAL: Heat stress for " + cropName);
            alerts.add("Current temperature: " + currentTemp + "°C");
            alerts.add("Optimal range: " + minOptimal + "-" + maxOptimal + "°C");
            alerts.add("\nIMMEDIATE ACTIONS:");
            alerts.add("- Increase irrigation frequency");
            alerts.add("- Irrigate in evening to cool soil");
            alerts.add("- Apply mulch to reduce soil temperature");
            alerts.add("- Consider shade nets for vegetables");
            alerts.add("\nEXPECTED IMPACTS:");
            alerts.add("- Flower drop and poor fruit set");
            alerts.add("- Reduced photosynthesis");
            alerts.add("- Sunburn on fruits");
            alerts.add("- Increased pest activity");
        } else if (currentTemp > maxOptimal) {
            alerts.add("WARNING: Temperature above optimal");
            alerts.add("Current: " + currentTemp + "°C, Optimal: " + minOptimal + "-" + maxOptimal + "°C");
            alerts.add("Increase monitoring and irrigation");
        } else {
            alerts.add("OPTIMAL: Temperature within ideal range");
            alerts.add("Current: " + currentTemp + "°C (Optimal: " + minOptimal + "-" + maxOptimal + "°C)");
            alerts.add("Continue normal crop management");
        }

        return alerts;
    }

    /**
     * Analyze disease risk based on weather
     */
    public static List<String> assessDiseaseRisk(double temperature, double humidity, double rainfall) {
        List<String> assessment = new ArrayList<>();

        // Fungal disease risk
        if (humidity > 80 && temperature > 20 && temperature < 30) {
            assessment.add("HIGH RISK: Fungal disease outbreak likely");
            assessment.add("Conditions: High humidity (" + humidity + "%), moderate temp (" + temperature + "°C)");
            assessment.add("\nPREVENTIVE ACTIONS:");
            assessment.add("- Spray preventive fungicide immediately");
            assessment.add("- Improve air circulation (pruning, spacing)");
            assessment.add("- Avoid overhead irrigation");
            assessment.add("- Remove infected plant parts");
            assessment.add("\nHIGH RISK DISEASES:");
            assessment.add("- Late blight (potato, tomato)");
            assessment.add("- Downy mildew");
            assessment.add("- Anthracnose");
            assessment.add("- Leaf spots");
        } else if (humidity > 70 && rainfall > 50) {
            assessment.add("MODERATE RISK: Fungal diseases possible");
            assessment.add("Monitor crops closely for symptoms");
            assessment.add("Keep fungicide ready for spray");
        }

        // Bacterial disease risk
        if (rainfall > 100 && temperature > 25) {
            assessment.add("WARNING: Bacterial disease risk elevated");
            assessment.add("Heavy rain (" + rainfall + " mm) can spread bacteria");
            assessment.add("Ensure good drainage");
            assessment.add("Apply copper-based bactericides if symptoms appear");
        }

        // Viral disease risk (vector activity)
        if (temperature > 28 && humidity < 60) {
            assessment.add("ALERT: High aphid and whitefly activity expected");
            assessment.add("Increased risk of viral disease transmission");
            assessment.add("Install yellow sticky traps");
            assessment.add("Spray insecticide to control vectors");
        }

        if (assessment.isEmpty()) {
            assessment.add("LOW RISK: Weather conditions not favoring diseases");
            assessment.add("Continue routine monitoring");
        }

        return assessment;
    }

    /**
     * Determine harvest readiness
     */
    public static List<String> assessHarvestReadiness(int daysAfterPlanting, int normalDuration, String cropName) {
        List<String> recommendations = new ArrayList<>();

        double maturityPercentage = (double) daysAfterPlanting / normalDuration * 100;

        if (maturityPercentage >= 100) {
            recommendations.add("HARVEST READY: " + cropName + " has reached maturity");
            recommendations.add("Days after planting: " + daysAfterPlanting);
            recommendations.add("Normal duration: " + normalDuration + " days");
            recommendations.add("\nHARVEST INDICATORS TO CHECK:");

            // Crop-specific indicators
            switch (cropName.toLowerCase()) {
                case "rice":
                case "paddy":
                    recommendations.add("- 80-85% of grains are golden yellow");
                    recommendations.add("- Grains are hard when pressed with teeth");
                    recommendations.add("- Moisture content: 20-25%");
                    recommendations.add("- Early morning harvest recommended");
                    break;

                case "wheat":
                    recommendations.add("- Grains are hard and cannot be dented by fingernail");
                    recommendations.add("- Moisture content: 25-30%");
                    recommendations.add("- Straw becomes dry and pale yellow");
                    break;

                case "tomato":
                    recommendations.add("- Color changes from green to red/orange");
                    recommendations.add("- Fruit is firm but slightly soft");
                    recommendations.add("- For storage: Pick at pink stage");
                    recommendations.add("- For local market: Full red stage");
                    break;

                case "potato":
                    recommendations.add("- Skin is firm and does not rub off easily");
                    recommendations.add("- Foliage has dried completely");
                    recommendations.add("- Let tubers mature 10-15 days after vine death");
                    recommendations.add("- Harvest in dry weather");
                    break;

                case "cotton":
                    recommendations.add("- Bolls have opened fully");
                    recommendations.add("- Lint is dry and fluffy");
                    recommendations.add("- Avoid harvesting wet cotton");
                    recommendations.add("- Multiple pickings needed");
                    break;

                default:
                    recommendations.add("- Check crop maturity indicators");
                    recommendations.add("- Consult local agricultural officer");
            }

            recommendations.add("\nPOST-HARVEST CARE:");
            recommendations.add("- Harvest in dry weather");
            recommendations.add("- Proper drying before storage");
            recommendations.add("- Clean storage facilities");
            recommendations.add("- Monitor market prices");

        } else if (maturityPercentage >= 90) {
            recommendations.add("APPROACHING MATURITY: " + cropName);
            recommendations.add("Maturity: " + String.format("%.0f", maturityPercentage) + "%");
            recommendations.add("Expected harvest in: " + (normalDuration - daysAfterPlanting) + " days");
            recommendations.add("\nPREPARATIONS:");
            recommendations.add("- Stop nitrogen fertilization");
            recommendations.add("- Reduce irrigation gradually");
            recommendations.add("- Prepare harvesting equipment");
            recommendations.add("- Arrange labor and transport");
            recommendations.add("- Monitor market prices daily");
        } else if (maturityPercentage >= 75) {
            recommendations.add("REPRODUCTIVE STAGE: " + cropName);
            recommendations.add("Maturity: " + String.format("%.0f", maturityPercentage) + "%");
            recommendations.add("Critical period for yield formation");
            recommendations.add("Ensure adequate water and nutrients");
            recommendations.add("Protect from pests and diseases");
        } else {
            recommendations.add("VEGETATIVE/GROWTH STAGE: " + cropName);
            recommendations.add("Maturity: " + String.format("%.0f", maturityPercentage) + "%");
            recommendations.add("Days remaining: " + (normalDuration - daysAfterPlanting));
            recommendations.add("Focus on crop health and growth");
        }

        return recommendations;
    }

    /**
     * Market price alert system
     */
    public static List<String> marketPriceRecommendation(double currentPrice, double averagePrice,
            double historicHigh) {
        List<String> advice = new ArrayList<>();

        double priceComparison = (currentPrice / averagePrice) * 100;
        double highComparison = (currentPrice / historicHigh) * 100;

        if (priceComparison > 110) {
            advice.add("SELL NOW: Prices are above average");
            advice.add("Current: ₹" + currentPrice + "/quintal");
            advice.add("Average: ₹" + averagePrice + "/quintal");
            advice.add("Price is " + String.format("%.0f", priceComparison - 100) + "% above normal");
            advice.add("\nREASONS TO SELL:");
            advice.add("- Good profit margins");
            advice.add("- Prices may decline with increased arrivals");
        } else if (highComparison > 90) {
            advice.add("EXCELLENT PRICES: Near historic high");
            advice.add("Current: ₹" + currentPrice);
            advice.add("Historic high: ₹" + historicHigh);
            advice.add("RECOMMENDATION: Sell immediately");
        } else if (priceComparison < 90) {
            advice.add("HOLD: Prices are below average");
            advice.add("Current: ₹" + currentPrice);
            advice.add("Average: ₹" + averagePrice);
            advice.add("Price is " + String.format("%.0f", 100 - priceComparison) + "% below normal");
            advice.add("\nRECOMMENDATIONS:");
            advice.add("- Store if storage facilities available");
            advice.add("- Prices typically improve in 15-30 days");
            advice.add("- Check mandis in nearby districts");
        } else {
            advice.add("NORMAL PRICES: At market average");
            advice.add("Current: ₹" + currentPrice);
            advice.add("Sell if storage not available");
            advice.add("Monitor price trends for next 7 days");
        }

        return advice;
    }
}
