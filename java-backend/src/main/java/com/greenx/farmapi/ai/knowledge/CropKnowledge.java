package com.greenx.farmapi.ai.knowledge;

import java.util.*;

/**
 * Crop Knowledge Base
 * Contains crop requirements, suitability, and recommendations
 */
public class CropKnowledge {

    public enum Season {
        KHARIF, // Monsoon season (June-October)
        RABI, // Winter season (October-March)
        ZAID // Summer season (March-June)
    }

    public enum CropCategory {
        CEREAL, PULSE, VEGETABLE, FRUIT, CASH_CROP, OILSEED
    }

    public static class CropData {
        public String name;
        public CropCategory category;
        public List<Season> seasons;
        public List<SoilAnalysisKnowledge.SoilType> suitableSoilTypes;
        public double minPH;
        public double maxPH;
        public double minRainfall; // mm
        public double maxRainfall; // mm
        public double minTemp; // Celsius
        public double maxTemp; // Celsius
        public int durationDays;
        public double nitrogenRequired; // kg/ha
        public double phosphorusRequired; // kg/ha
        public double potassiumRequired; // kg/ha
        public List<String> diseases;
        public List<String> pests;
        public Map<String, String> growthStages;

        public CropData(String name, CropCategory category) {
            this.name = name;
            this.category = category;
            this.seasons = new ArrayList<>();
            this.suitableSoilTypes = new ArrayList<>();
            this.diseases = new ArrayList<>();
            this.pests = new ArrayList<>();
            this.growthStages = new HashMap<>();
        }
    }

    private static final Map<String, CropData> CROP_DATABASE = new HashMap<>();

    static {
        initializeCropDatabase();
    }

    private static void initializeCropDatabase() {

        // CEREALS

        // Rice/Paddy
        CropData rice = new CropData("Rice", CropCategory.CEREAL);
        rice.seasons = Arrays.asList(Season.KHARIF, Season.RABI);
        rice.suitableSoilTypes = Arrays.asList(
                SoilAnalysisKnowledge.SoilType.CLAY,
                SoilAnalysisKnowledge.SoilType.CLAY_LOAM,
                SoilAnalysisKnowledge.SoilType.LOAMY);
        rice.minPH = 5.5;
        rice.maxPH = 7.0;
        rice.minRainfall = 1000;
        rice.maxRainfall = 2500;
        rice.minTemp = 20;
        rice.maxTemp = 35;
        rice.durationDays = 120;
        rice.nitrogenRequired = 120;
        rice.phosphorusRequired = 40;
        rice.potassiumRequired = 40;
        rice.diseases = Arrays.asList("Blast", "Bacterial leaf blight", "Sheath blight", "Brown spot");
        rice.pests = Arrays.asList("Stem borer", "Leaf folder", "Brown plant hopper", "Rice bug");
        rice.growthStages.put("Germination", "0-10 days");
        rice.growthStages.put("Tillering", "15-40 days");
        rice.growthStages.put("Panicle initiation", "40-60 days");
        rice.growthStages.put("Flowering", "60-80 days");
        rice.growthStages.put("Maturity", "100-120 days");
        CROP_DATABASE.put("rice", rice);
        CROP_DATABASE.put("paddy", rice);

        // Wheat
        CropData wheat = new CropData("Wheat", CropCategory.CEREAL);
        wheat.seasons = Arrays.asList(Season.RABI);
        wheat.suitableSoilTypes = Arrays.asList(
                SoilAnalysisKnowledge.SoilType.LOAMY,
                SoilAnalysisKnowledge.SoilType.CLAY_LOAM,
                SoilAnalysisKnowledge.SoilType.SILT_LOAM);
        wheat.minPH = 6.0;
        wheat.maxPH = 7.5;
        wheat.minRainfall = 450;
        wheat.maxRainfall = 750;
        wheat.minTemp = 10;
        wheat.maxTemp = 25;
        wheat.durationDays = 120;
        wheat.nitrogenRequired = 120;
        wheat.phosphorusRequired = 60;
        wheat.potassiumRequired = 40;
        wheat.diseases = Arrays.asList("Rust", "Powdery mildew", "Karnal bunt", "Loose smut");
        wheat.pests = Arrays.asList("Aphids", "Termites", "Army worm", "Pink borer");
        wheat.growthStages.put("Germination", "0-7 days");
        wheat.growthStages.put("Tillering", "25-35 days");
        wheat.growthStages.put("Jointing", "40-50 days");
        wheat.growthStages.put("Flowering", "60-70 days");
        wheat.growthStages.put("Maturity", "110-125 days");
        CROP_DATABASE.put("wheat", wheat);

        // Maize/Corn
        CropData maize = new CropData("Maize", CropCategory.CEREAL);
        maize.seasons = Arrays.asList(Season.KHARIF, Season.RABI);
        maize.suitableSoilTypes = Arrays.asList(
                SoilAnalysisKnowledge.SoilType.LOAMY,
                SoilAnalysisKnowledge.SoilType.SANDY_LOAM,
                SoilAnalysisKnowledge.SoilType.CLAY_LOAM);
        maize.minPH = 5.5;
        maize.maxPH = 7.5;
        maize.minRainfall = 500;
        maize.maxRainfall = 1200;
        maize.minTemp = 18;
        maize.maxTemp = 32;
        maize.durationDays = 90;
        maize.nitrogenRequired = 150;
        maize.phosphorusRequired = 60;
        maize.potassiumRequired = 40;
        maize.diseases = Arrays.asList("Maydis leaf blight", "Downy mildew", "Common rust");
        maize.pests = Arrays.asList("Stem borer", "Fall army worm", "Shoot fly", "Pink borer");
        maize.growthStages.put("Germination", "0-10 days");
        maize.growthStages.put("Vegetative", "10-45 days");
        maize.growthStages.put("Tasseling", "45-60 days");
        maize.growthStages.put("Silking", "60-70 days");
        maize.growthStages.put("Maturity", "85-95 days");
        CROP_DATABASE.put("maize", maize);
        CROP_DATABASE.put("corn", maize);

        // PULSES

        // Chickpea/Gram
        CropData chickpea = new CropData("Chickpea", CropCategory.PULSE);
        chickpea.seasons = Arrays.asList(Season.RABI);
        chickpea.suitableSoilTypes = Arrays.asList(
                SoilAnalysisKnowledge.SoilType.LOAMY,
                SoilAnalysisKnowledge.SoilType.CLAY_LOAM,
                SoilAnalysisKnowledge.SoilType.SANDY_LOAM);
        chickpea.minPH = 6.0;
        chickpea.maxPH = 8.0;
        chickpea.minRainfall = 400;
        chickpea.maxRainfall = 650;
        chickpea.minTemp = 10;
        chickpea.maxTemp = 30;
        chickpea.durationDays = 110;
        chickpea.nitrogenRequired = 20; // Low - legume fixes nitrogen
        chickpea.phosphorusRequired = 50;
        chickpea.potassiumRequired = 30;
        chickpea.diseases = Arrays.asList("Wilt", "Blight", "Root rot", "Ascochyta blight");
        chickpea.pests = Arrays.asList("Pod borer", "Aphids", "Leaf miner", "Cut worm");
        chickpea.growthStages.put("Germination", "0-10 days");
        chickpea.growthStages.put("Vegetative", "10-40 days");
        chickpea.growthStages.put("Flowering", "40-70 days");
        chickpea.growthStages.put("Pod development", "70-95 days");
        chickpea.growthStages.put("Maturity", "100-115 days");
        CROP_DATABASE.put("chickpea", chickpea);
        CROP_DATABASE.put("gram", chickpea);
        CROP_DATABASE.put("chana", chickpea);

        // Pigeon Pea/Tur
        CropData pigeonpea = new CropData("Pigeon Pea", CropCategory.PULSE);
        pigeonpea.seasons = Arrays.asList(Season.KHARIF);
        pigeonpea.suitableSoilTypes = Arrays.asList(
                SoilAnalysisKnowledge.SoilType.LOAMY,
                SoilAnalysisKnowledge.SoilType.SANDY_LOAM,
                SoilAnalysisKnowledge.SoilType.CLAY_LOAM);
        pigeonpea.minPH = 5.5;
        pigeonpea.maxPH = 7.5;
        pigeonpea.minRainfall = 600;
        pigeonpea.maxRainfall = 1000;
        pigeonpea.minTemp = 20;
        pigeonpea.maxTemp = 35;
        pigeonpea.durationDays = 150;
        pigeonpea.nitrogenRequired = 25;
        pigeonpea.phosphorusRequired = 50;
        pigeonpea.potassiumRequired = 25;
        pigeonpea.diseases = Arrays.asList("Wilt", "Sterility mosaic", "Phytophthora blight");
        pigeonpea.pests = Arrays.asList("Pod borer", "Pod fly", "Plume moth", "Aphids");
        pigeonpea.growthStages.put("Germination", "0-15 days");
        pigeonpea.growthStages.put("Vegetative", "15-90 days");
        pigeonpea.growthStages.put("Flowering", "90-120 days");
        pigeonpea.growthStages.put("Pod development", "120-145 days");
        pigeonpea.growthStages.put("Maturity", "145-160 days");
        CROP_DATABASE.put("pigeonpea", pigeonpea);
        CROP_DATABASE.put("tur", pigeonpea);
        CROP_DATABASE.put("arhar", pigeonpea);

        // VEGETABLES

        // Tomato
        CropData tomato = new CropData("Tomato", CropCategory.VEGETABLE);
        tomato.seasons = Arrays.asList(Season.RABI, Season.ZAID);
        tomato.suitableSoilTypes = Arrays.asList(
                SoilAnalysisKnowledge.SoilType.LOAMY,
                SoilAnalysisKnowledge.SoilType.SANDY_LOAM,
                SoilAnalysisKnowledge.SoilType.CLAY_LOAM);
        tomato.minPH = 6.0;
        tomato.maxPH = 7.0;
        tomato.minRainfall = 600;
        tomato.maxRainfall = 1500;
        tomato.minTemp = 15;
        tomato.maxTemp = 30;
        tomato.durationDays = 75;
        tomato.nitrogenRequired = 100;
        tomato.phosphorusRequired = 50;
        tomato.potassiumRequired = 50;
        tomato.diseases = Arrays.asList("Early blight", "Late blight", "Leaf curl", "Bacterial wilt",
                "Septoria leaf spot");
        tomato.pests = Arrays.asList("Fruit borer", "Whitefly", "Aphids", "Leaf miner", "Thrips");
        tomato.growthStages.put("Germination", "0-7 days");
        tomato.growthStages.put("Seedling", "7-25 days");
        tomato.growthStages.put("Vegetative", "25-45 days");
        tomato.growthStages.put("Flowering", "45-60 days");
        tomato.growthStages.put("Fruiting", "60-90 days");
        CROP_DATABASE.put("tomato", tomato);

        // Potato
        CropData potato = new CropData("Potato", CropCategory.VEGETABLE);
        potato.seasons = Arrays.asList(Season.RABI);
        potato.suitableSoilTypes = Arrays.asList(
                SoilAnalysisKnowledge.SoilType.LOAMY,
                SoilAnalysisKnowledge.SoilType.SANDY_LOAM);
        potato.minPH = 5.5;
        potato.maxPH = 6.5;
        potato.minRainfall = 500;
        potato.maxRainfall = 700;
        potato.minTemp = 15;
        potato.maxTemp = 25;
        potato.durationDays = 90;
        potato.nitrogenRequired = 150;
        potato.phosphorusRequired = 50;
        potato.potassiumRequired = 100;
        potato.diseases = Arrays.asList("Late blight", "Early blight", "Bacterial wilt", "Black scurf");
        potato.pests = Arrays.asList("Potato tuber moth", "Aphids", "Whitefly", "Leaf hopper");
        potato.growthStages.put("Sprout development", "0-15 days");
        potato.growthStages.put("Vegetative", "15-45 days");
        potato.growthStages.put("Tuber initiation", "45-60 days");
        potato.growthStages.put("Tuber bulking", "60-85 days");
        potato.growthStages.put("Maturity", "85-100 days");
        CROP_DATABASE.put("potato", potato);

        // Onion
        CropData onion = new CropData("Onion", CropCategory.VEGETABLE);
        onion.seasons = Arrays.asList(Season.RABI, Season.KHARIF);
        onion.suitableSoilTypes = Arrays.asList(
                SoilAnalysisKnowledge.SoilType.LOAMY,
                SoilAnalysisKnowledge.SoilType.SANDY_LOAM,
                SoilAnalysisKnowledge.SoilType.CLAY_LOAM);
        onion.minPH = 6.0;
        onion.maxPH = 7.5;
        onion.minRainfall = 650;
        onion.maxRainfall = 750;
        onion.minTemp = 13;
        onion.maxTemp = 30;
        onion.durationDays = 120;
        onion.nitrogenRequired = 100;
        onion.phosphorusRequired = 50;
        onion.potassiumRequired = 50;
        onion.diseases = Arrays.asList("Purple blotch", "Stemphylium blight", "Basal rot", "White rot");
        onion.pests = Arrays.asList("Thrips", "Onion maggot", "Leaf miner", "Cutworm");
        onion.growthStages.put("Germination", "0-7 days");
        onion.growthStages.put("Seedling", "7-30 days");
        onion.growthStages.put("Bulb initiation", "30-75 days");
        onion.growthStages.put("Bulb development", "75-110 days");
        onion.growthStages.put("Maturity", "110-130 days");
        CROP_DATABASE.put("onion", onion);

        // FRUITS

        // Mango
        CropData mango = new CropData("Mango", CropCategory.FRUIT);
        mango.seasons = Arrays.asList(Season.KHARIF); // Fruiting season
        mango.suitableSoilTypes = Arrays.asList(
                SoilAnalysisKnowledge.SoilType.LOAMY,
                SoilAnalysisKnowledge.SoilType.SANDY_LOAM,
                SoilAnalysisKnowledge.SoilType.CLAY_LOAM);
        mango.minPH = 5.5;
        mango.maxPH = 7.5;
        mango.minRainfall = 750;
        mango.maxRainfall = 2500;
        mango.minTemp = 24;
        mango.maxTemp = 30;
        mango.durationDays = 90; // Fruit development
        mango.nitrogenRequired = 500; // Per tree per year
        mango.phosphorusRequired = 250;
        mango.potassiumRequired = 500;
        mango.diseases = Arrays.asList("Anthracnose", "Powdery mildew", "Bacterial canker", "Malformation");
        mango.pests = Arrays.asList("Mango hopper", "Fruit fly", "Stem borer", "Mealy bug");
        mango.growthStages.put("Flowering", "January-March");
        mango.growthStages.put("Fruit set", "March-April");
        mango.growthStages.put("Fruit development", "April-May");
        mango.growthStages.put("Maturity", "May-July");
        CROP_DATABASE.put("mango", mango);

        // Banana
        CropData banana = new CropData("Banana", CropCategory.FRUIT);
        banana.seasons = Arrays.asList(Season.KHARIF, Season.RABI); // Year-round
        banana.suitableSoilTypes = Arrays.asList(
                SoilAnalysisKnowledge.SoilType.LOAMY,
                SoilAnalysisKnowledge.SoilType.CLAY_LOAM,
                SoilAnalysisKnowledge.SoilType.SILT_LOAM);
        banana.minPH = 6.0;
        banana.maxPH = 7.5;
        banana.minRainfall = 1000;
        banana.maxRainfall = 2500;
        banana.minTemp = 15;
        banana.maxTemp = 35;
        banana.durationDays = 300; // Planting to harvest
        banana.nitrogenRequired = 200;
        banana.phosphorusRequired = 60;
        banana.potassiumRequired = 300;
        banana.diseases = Arrays.asList("Panama wilt", "Sigatoka", "Bunchy top", "Bacterial wilt");
        banana.pests = Arrays.asList("Banana weevil", "Aphids", "Thrips", "Nematodes");
        banana.growthStages.put("Establishment", "0-60 days");
        banana.growthStages.put("Vegetative", "60-180 days");
        banana.growthStages.put("Flowering", "180-240 days");
        banana.growthStages.put("Fruiting", "240-300 days");
        CROP_DATABASE.put("banana", banana);

        // CASH CROPS

        // Cotton
        CropData cotton = new CropData("Cotton", CropCategory.CASH_CROP);
        cotton.seasons = Arrays.asList(Season.KHARIF);
        cotton.suitableSoilTypes = Arrays.asList(
                SoilAnalysisKnowledge.SoilType.LOAMY,
                SoilAnalysisKnowledge.SoilType.CLAY_LOAM,
                SoilAnalysisKnowledge.SoilType.SANDY_LOAM);
        cotton.minPH = 5.5;
        cotton.maxPH = 8.0;
        cotton.minRainfall = 500;
        cotton.maxRainfall = 1250;
        cotton.minTemp = 21;
        cotton.maxTemp = 30;
        cotton.durationDays = 180;
        cotton.nitrogenRequired = 120;
        cotton.phosphorusRequired = 60;
        cotton.potassiumRequired = 60;
        cotton.diseases = Arrays.asList("Bacterial blight", "Verticillium wilt", "Root rot", "Grey mildew");
        cotton.pests = Arrays.asList("Bollworm", "Jassids", "Aphids", "Whitefly", "Thrips");
        cotton.growthStages.put("Germination", "0-15 days");
        cotton.growthStages.put("Squaring", "40-60 days");
        cotton.growthStages.put("Flowering", "60-120 days");
        cotton.growthStages.put("Boll development", "120-150 days");
        cotton.growthStages.put("Maturity", "150-190 days");
        CROP_DATABASE.put("cotton", cotton);

        // Sugarcane
        CropData sugarcane = new CropData("Sugarcane", CropCategory.CASH_CROP);
        sugarcane.seasons = Arrays.asList(Season.KHARIF, Season.RABI);
        sugarcane.suitableSoilTypes = Arrays.asList(
                SoilAnalysisKnowledge.SoilType.LOAMY,
                SoilAnalysisKnowledge.SoilType.CLAY_LOAM,
                SoilAnalysisKnowledge.SoilType.SILT_LOAM);
        sugarcane.minPH = 6.5;
        sugarcane.maxPH = 7.5;
        sugarcane.minRainfall = 1500;
        sugarcane.maxRainfall = 2500;
        sugarcane.minTemp = 20;
        sugarcane.maxTemp = 30;
        sugarcane.durationDays = 365; // 12 months
        sugarcane.nitrogenRequired = 250;
        sugarcane.phosphorusRequired = 115;
        sugarcane.potassiumRequired = 115;
        sugarcane.diseases = Arrays.asList("Red rot", "Smut", "Wilt", "Grassy shoot");
        sugarcane.pests = Arrays.asList("Early shoot borer", "Top borer", "Termites", "Pyrilla");
        sugarcane.growthStages.put("Germination", "0-45 days");
        sugarcane.growthStages.put("Tillering", "45-120 days");
        sugarcane.growthStages.put("Grand growth", "120-270 days");
        sugarcane.growthStages.put("Maturity", "270-365 days");
        CROP_DATABASE.put("sugarcane", sugarcane);
    }

    /**
     * Get crop data by name
     */
    public static CropData getCropData(String cropName) {
        return CROP_DATABASE.get(cropName.toLowerCase());
    }

    /**
     * Recommend crops based on soil and climate conditions
     */
    public static List<String> recommendCrops(
            SoilAnalysisKnowledge.SoilType soilType,
            double pH,
            Season season,
            double rainfall,
            double temperature) {
        List<String> recommendations = new ArrayList<>();

        for (Map.Entry<String, CropData> entry : CROP_DATABASE.entrySet()) {
            CropData crop = entry.getValue();

            // Check if conditions match
            boolean soilMatch = crop.suitableSoilTypes.contains(soilType);
            boolean pHMatch = pH >= crop.minPH && pH <= crop.maxPH;
            boolean seasonMatch = crop.seasons.contains(season);
            boolean rainfallMatch = rainfall >= crop.minRainfall && rainfall <= crop.maxRainfall;
            boolean tempMatch = temperature >= crop.minTemp && temperature <= crop.maxTemp;

            int matchScore = 0;
            if (soilMatch)
                matchScore += 2;
            if (pHMatch)
                matchScore += 2;
            if (seasonMatch)
                matchScore += 2;
            if (rainfallMatch)
                matchScore++;
            if (tempMatch)
                matchScore++;

            if (matchScore >= 5) {
                recommendations.add(crop.name + " (" + crop.category + ") - Match: " + matchScore + "/8");
            }
        }

        if (recommendations.isEmpty()) {
            recommendations.add("No perfect matches found. Soil amendments recommended.");
        }

        return recommendations;
    }

    /**
     * Get crop nutrient requirements
     */
    public static Map<String, Double> getCropNutrientNeeds(String cropName) {
        CropData crop = getCropData(cropName);
        if (crop == null)
            return null;

        Map<String, Double> nutrients = new HashMap<>();
        nutrients.put("nitrogen", crop.nitrogenRequired);
        nutrients.put("phosphorus", crop.phosphorusRequired);
        nutrients.put("potassium", crop.potassiumRequired);

        return nutrients;
    }

    /**
     * Get all crops in database
     */
    public static List<String> getAllCrops() {
        return new ArrayList<>(CROP_DATABASE.keySet());
    }

    /**
     * Get crops by category
     */
    public static List<String> getCropsByCategory(CropCategory category) {
        List<String> crops = new ArrayList<>();
        for (Map.Entry<String, CropData> entry : CROP_DATABASE.entrySet()) {
            if (entry.getValue().category == category) {
                crops.add(entry.getKey());
            }
        }
        return crops;
    }
}
