package com.greenx.farmapi.ai.knowledge;

import java.util.*;

/**
 * Soil Analysis Knowledge Base
 * Contains rules for soil health parameters and recommendations
 */
public class SoilAnalysisKnowledge {

    // Soil pH ranges
    public static final double PH_VERY_ACIDIC = 5.5;
    public static final double PH_SLIGHTLY_ACIDIC = 6.0;
    public static final double PH_NEUTRAL = 7.0;
    public static final double PH_SLIGHTLY_ALKALINE = 7.5;
    public static final double PH_VERY_ALKALINE = 8.5;

    // NPK levels (kg/ha)
    public static final double NITROGEN_LOW = 280;
    public static final double NITROGEN_MEDIUM = 450;
    public static final double NITROGEN_HIGH = 560;

    public static final double PHOSPHORUS_LOW = 11;
    public static final double PHOSPHORUS_MEDIUM = 22;
    public static final double PHOSPHORUS_HIGH = 56;

    public static final double POTASSIUM_LOW = 110;
    public static final double POTASSIUM_MEDIUM = 280;
    public static final double POTASSIUM_HIGH = 340;

    // Organic carbon (%)
    public static final double ORGANIC_CARBON_LOW = 0.5;
    public static final double ORGANIC_CARBON_MEDIUM = 0.75;
    public static final double ORGANIC_CARBON_HIGH = 1.0;

    // Soil moisture (%)
    public static final double MOISTURE_DRY = 20;
    public static final double MOISTURE_OPTIMAL = 40;
    public static final double MOISTURE_WET = 60;

    // EC (Electrical Conductivity) - dS/m
    public static final double EC_NORMAL = 2.0;
    public static final double EC_SALINE = 4.0;
    public static final double EC_HIGHLY_SALINE = 8.0;

    public enum SoilType {
        CLAY, SANDY, LOAMY, SILT, CLAY_LOAM, SANDY_LOAM, SILT_LOAM
    }

    /**
     * Analyze soil pH and provide recommendations
     */
    public static List<String> analyzePH(double ph) {
        List<String> recommendations = new ArrayList<>();

        if (ph < PH_VERY_ACIDIC) {
            recommendations.add("CRITICAL: Soil is highly acidic (pH " + ph + ")");
            recommendations.add("Apply lime (CaCO3) at 2-4 tons/hectare");
            recommendations.add("Consider dolomite lime if magnesium is also low");
            recommendations.add("Retest soil after 3 months");
        } else if (ph < PH_SLIGHTLY_ACIDIC) {
            recommendations.add("WARNING: Soil is slightly acidic (pH " + ph + ")");
            recommendations.add("Apply lime at 1-2 tons/hectare");
            recommendations.add("Suitable for acid-tolerant crops temporarily");
        } else if (ph <= PH_NEUTRAL) {
            recommendations.add("GOOD: Soil pH is slightly acidic to neutral (pH " + ph + ")");
            recommendations.add("Maintain current pH with balanced fertilization");
        } else if (ph <= PH_SLIGHTLY_ALKALINE) {
            recommendations.add("GOOD: Soil pH is neutral to slightly alkaline (pH " + ph + ")");
            recommendations.add("Ideal for most crops");
        } else if (ph <= PH_VERY_ALKALINE) {
            recommendations.add("WARNING: Soil is alkaline (pH " + ph + ")");
            recommendations.add("Apply gypsum (CaSO4) at 2-3 tons/hectare");
            recommendations.add("Add organic matter to improve soil structure");
        } else {
            recommendations.add("CRITICAL: Soil is highly alkaline (pH " + ph + ")");
            recommendations.add("Apply sulfur at 500-1000 kg/hectare");
            recommendations.add("Use acidifying fertilizers like ammonium sulfate");
            recommendations.add("Consider raised bed cultivation");
        }

        return recommendations;
    }

    /**
     * Analyze Nitrogen levels
     */
    public static List<String> analyzeNitrogen(double nitrogen) {
        List<String> recommendations = new ArrayList<>();

        if (nitrogen < NITROGEN_LOW) {
            recommendations.add("CRITICAL: Nitrogen deficiency detected (" + nitrogen + " kg/ha)");
            recommendations.add("Apply urea at 200-250 kg/hectare immediately");
            recommendations.add("Alternative: Apply FYM (Farm Yard Manure) at 10-15 tons/hectare");
            recommendations.add("Consider green manure crops (dhaincha, sunhemp)");
            recommendations.add("Expected symptoms: Yellowing of older leaves, stunted growth");
        } else if (nitrogen < NITROGEN_MEDIUM) {
            recommendations.add("WARNING: Nitrogen is below optimal (" + nitrogen + " kg/ha)");
            recommendations.add("Apply urea at 100-150 kg/hectare");
            recommendations.add("Top dressing recommended during vegetative stage");
        } else if (nitrogen <= NITROGEN_HIGH) {
            recommendations.add("GOOD: Nitrogen levels are optimal (" + nitrogen + " kg/ha)");
            recommendations.add("Maintain with balanced NPK fertilization");
        } else {
            recommendations.add("CAUTION: Excess nitrogen detected (" + nitrogen + " kg/ha)");
            recommendations.add("Avoid nitrogen fertilizers this season");
            recommendations.add("Risk: Lodging, delayed maturity, disease susceptibility");
        }

        return recommendations;
    }

    /**
     * Analyze Phosphorus levels
     */
    public static List<String> analyzePhosphorus(double phosphorus) {
        List<String> recommendations = new ArrayList<>();

        if (phosphorus < PHOSPHORUS_LOW) {
            recommendations.add("CRITICAL: Phosphorus deficiency (" + phosphorus + " kg/ha)");
            recommendations.add("Apply Single Super Phosphate (SSP) at 300-400 kg/hectare");
            recommendations.add("Alternative: Di-Ammonium Phosphate (DAP) at 150-200 kg/hectare");
            recommendations.add("Apply rock phosphate for long-term improvement");
            recommendations.add("Expected symptoms: Purple/dark green leaves, poor root development");
        } else if (phosphorus < PHOSPHORUS_MEDIUM) {
            recommendations.add("WARNING: Phosphorus is below optimal (" + phosphorus + " kg/ha)");
            recommendations.add("Apply SSP at 150-200 kg/hectare");
            recommendations.add("Apply at sowing for best results");
        } else if (phosphorus <= PHOSPHORUS_HIGH) {
            recommendations.add("GOOD: Phosphorus levels are optimal (" + phosphorus + " kg/ha)");
            recommendations.add("Maintain with regular fertilization");
        } else {
            recommendations.add("EXCESS: High phosphorus levels (" + phosphorus + " kg/ha)");
            recommendations.add("Skip phosphatic fertilizers this season");
        }

        return recommendations;
    }

    /**
     * Analyze Potassium levels
     */
    public static List<String> analyzePotassium(double potassium) {
        List<String> recommendations = new ArrayList<>();

        if (potassium < POTASSIUM_LOW) {
            recommendations.add("CRITICAL: Potassium deficiency (" + potassium + " kg/ha)");
            recommendations.add("Apply Muriate of Potash (MOP) at 100-150 kg/hectare");
            recommendations.add("Alternative: Sulphate of Potash (SOP) for sensitive crops");
            recommendations.add("Apply ash from burnt crop residues (rich in K)");
            recommendations.add("Expected symptoms: Leaf margin scorching, weak stems");
        } else if (potassium < POTASSIUM_MEDIUM) {
            recommendations.add("WARNING: Potassium is below optimal (" + potassium + " kg/ha)");
            recommendations.add("Apply MOP at 50-75 kg/hectare");
        } else if (potassium <= POTASSIUM_HIGH) {
            recommendations.add("GOOD: Potassium levels are optimal (" + potassium + " kg/ha)");
            recommendations.add("Maintain with balanced fertilization");
        } else {
            recommendations.add("EXCESS: High potassium levels (" + potassium + " kg/ha)");
            recommendations.add("Reduce potash application this season");
        }

        return recommendations;
    }

    /**
     * Analyze Organic Carbon
     */
    public static List<String> analyzeOrganicCarbon(double organicCarbon) {
        List<String> recommendations = new ArrayList<>();

        if (organicCarbon < ORGANIC_CARBON_LOW) {
            recommendations.add("CRITICAL: Very low organic matter (" + organicCarbon + "%)");
            recommendations.add("Apply compost at 10-15 tons/hectare");
            recommendations.add("Apply FYM (Farm Yard Manure) at 15-20 tons/hectare");
            recommendations.add("Practice crop residue incorporation");
            recommendations.add("Grow green manure crops in off-season");
        } else if (organicCarbon < ORGANIC_CARBON_MEDIUM) {
            recommendations.add("WARNING: Low organic matter (" + organicCarbon + "%)");
            recommendations.add("Apply compost at 5-10 tons/hectare annually");
            recommendations.add("Practice mulching and crop rotation");
        } else if (organicCarbon < ORGANIC_CARBON_HIGH) {
            recommendations.add("GOOD: Adequate organic matter (" + organicCarbon + "%)");
            recommendations.add("Maintain with regular compost/FYM application");
        } else {
            recommendations.add("EXCELLENT: High organic matter (" + organicCarbon + "%)");
            recommendations.add("Soil health is very good");
            recommendations.add("Continue sustainable practices");
        }

        return recommendations;
    }

    /**
     * Analyze Soil Moisture
     */
    public static List<String> analyzeMoisture(double moisture) {
        List<String> recommendations = new ArrayList<>();

        if (moisture < MOISTURE_DRY) {
            recommendations.add("CRITICAL: Severe water stress (" + moisture + "%)");
            recommendations.add("Irrigate immediately - crops at risk");
            recommendations.add("Consider drip irrigation for water efficiency");
            recommendations.add("Apply mulch to conserve moisture");
        } else if (moisture < MOISTURE_OPTIMAL) {
            recommendations.add("WARNING: Soil moisture is low (" + moisture + "%)");
            recommendations.add("Schedule irrigation within 24-48 hours");
            recommendations.add("Monitor crop stress symptoms");
        } else if (moisture <= MOISTURE_WET) {
            recommendations.add("GOOD: Soil moisture is optimal (" + moisture + "%)");
            recommendations.add("Continue regular irrigation schedule");
        } else {
            recommendations.add("CAUTION: Excess moisture (" + moisture + "%)");
            recommendations.add("Ensure proper drainage to prevent waterlogging");
            recommendations.add("Risk: Root rot, fungal diseases");
            recommendations.add("Delay irrigation");
        }

        return recommendations;
    }

    /**
     * Analyze Electrical Conductivity (Salinity)
     */
    public static List<String> analyzeEC(double ec) {
        List<String> recommendations = new ArrayList<>();

        if (ec < EC_NORMAL) {
            recommendations.add("GOOD: Normal soil salinity (" + ec + " dS/m)");
            recommendations.add("Suitable for all crops");
        } else if (ec < EC_SALINE) {
            recommendations.add("WARNING: Slightly saline soil (" + ec + " dS/m)");
            recommendations.add("Use gypsum to displace sodium");
            recommendations.add("Improve drainage to leach salts");
            recommendations.add("Select salt-tolerant crop varieties");
        } else if (ec < EC_HIGHLY_SALINE) {
            recommendations.add("CRITICAL: Saline soil (" + ec + " dS/m)");
            recommendations.add("Apply gypsum at 4-6 tons/hectare");
            recommendations.add("Improve drainage system urgently");
            recommendations.add("Grow only salt-tolerant crops");
            recommendations.add("Consider sub-surface drainage");
        } else {
            recommendations.add("SEVERE: Highly saline soil (" + ec + " dS/m)");
            recommendations.add("Major reclamation needed");
            recommendations.add("Apply gypsum at 8-10 tons/hectare");
            recommendations.add("Install tile drainage system");
            recommendations.add("May require multiple years of treatment");
        }

        return recommendations;
    }

    /**
     * Get soil type characteristics
     */
    public static Map<String, Object> getSoilTypeInfo(SoilType soilType) {
        Map<String, Object> info = new HashMap<>();

        switch (soilType) {
            case CLAY:
                info.put("waterHolding", "High");
                info.put("drainage", "Poor");
                info.put("fertility", "High");
                info.put("workability", "Difficult when wet");
                info.put("recommendations", Arrays.asList(
                        "Add organic matter to improve structure",
                        "Avoid working when wet",
                        "Install drainage systems",
                        "Practice raised bed cultivation"));
                break;

            case SANDY:
                info.put("waterHolding", "Low");
                info.put("drainage", "Excellent");
                info.put("fertility", "Low");
                info.put("workability", "Easy");
                info.put("recommendations", Arrays.asList(
                        "Add organic matter regularly",
                        "Use mulching to retain moisture",
                        "Apply fertilizers in split doses",
                        "Consider drip irrigation"));
                break;

            case LOAMY:
                info.put("waterHolding", "Good");
                info.put("drainage", "Good");
                info.put("fertility", "Good");
                info.put("workability", "Easy");
                info.put("recommendations", Arrays.asList(
                        "Ideal soil type",
                        "Maintain organic matter levels",
                        "Practice crop rotation",
                        "Suitable for most crops"));
                break;

            case SILT:
                info.put("waterHolding", "High");
                info.put("drainage", "Moderate");
                info.put("fertility", "Moderate");
                info.put("workability", "Moderate");
                info.put("recommendations", Arrays.asList(
                        "Add organic matter",
                        "Avoid compaction",
                        "Practice cover cropping"));
                break;

            case CLAY_LOAM:
                info.put("waterHolding", "Good");
                info.put("drainage", "Good");
                info.put("fertility", "High");
                info.put("workability", "Good");
                info.put("recommendations", Arrays.asList(
                        "Very good soil for agriculture",
                        "Maintain structure with organic matter",
                        "Suitable for most crops"));
                break;

            case SANDY_LOAM:
                info.put("waterHolding", "Moderate");
                info.put("drainage", "Good");
                info.put("fertility", "Moderate");
                info.put("workability", "Excellent");
                info.put("recommendations", Arrays.asList(
                        "Good all-purpose soil",
                        "Add organic matter for better fertility",
                        "Wide crop suitability"));
                break;

            case SILT_LOAM:
                info.put("waterHolding", "Good");
                info.put("drainage", "Good");
                info.put("fertility", "High");
                info.put("workability", "Good");
                info.put("recommendations", Arrays.asList(
                        "Excellent agricultural soil",
                        "Maintain with organic practices",
                        "High productivity potential"));
                break;
        }

        return info;
    }
}
