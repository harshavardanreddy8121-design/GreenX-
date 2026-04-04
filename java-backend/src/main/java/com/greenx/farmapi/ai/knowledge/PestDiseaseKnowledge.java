package com.greenx.farmapi.ai.knowledge;

import java.util.*;

/**
 * Pest and Disease Knowledge Base
 * Contains symptoms, treatments, and preventive measures
 */
public class PestDiseaseKnowledge {

    public enum Severity {
        LOW, MEDIUM, HIGH, CRITICAL
    }

    public enum Type {
        PEST, DISEASE_FUNGAL, DISEASE_BACTERIAL, DISEASE_VIRAL, DISEASE_NEMATODE
    }

    public static class PestDiseaseData {
        public String name;
        public Type type;
        public List<String> symptoms;
        public List<String> affectedCrops;
        public Severity severity;
        public List<String> treatments;
        public List<String> preventiveMeasures;
        public String criticalAction;

        public PestDiseaseData(String name, Type type, Severity severity) {
            this.name = name;
            this.type = type;
            this.severity = severity;
            this.symptoms = new ArrayList<>();
            this.affectedCrops = new ArrayList<>();
            this.treatments = new ArrayList<>();
            this.preventiveMeasures = new ArrayList<>();
        }
    }

    private static final Map<String, PestDiseaseData> DATABASE = new HashMap<>();

    static {
        initializeDatabase();
    }

    private static void initializeDatabase() {

        // COMMON PESTS

        PestDiseaseData stemBorer = new PestDiseaseData("Stem Borer", Type.PEST, Severity.HIGH);
        stemBorer.affectedCrops = Arrays.asList("rice", "sugarcane", "maize");
        stemBorer.symptoms = Arrays.asList(
                "Dead heart in young plants",
                "White ear head in mature plants",
                "Holes in stems",
                "Frass (insect excrement) near stem nodes");
        stemBorer.treatments = Arrays.asList(
                "Spray Chlorantraniliprole 18.5% SC @ 150 ml/ha",
                "Apply Cartap hydrochloride 4G @ 18-20 kg/ha",
                "Release egg parasitoid Trichogramma japonica",
                "Apply Fipronil 0.3% GR @ 25 kg/ha at vegetative stage");
        stemBorer.preventiveMeasures = Arrays.asList(
                "Destroy stubbles after harvest",
                "Deep summer ploughing",
                "Avoid staggered planting",
                "Use resistant varieties",
                "Install pheromone traps @ 20/ha");
        stemBorer.criticalAction = "Spray insecticide immediately if 5% dead hearts observed";
        DATABASE.put("stem_borer", stemBorer);

        PestDiseaseData aphids = new PestDiseaseData("Aphids", Type.PEST, Severity.MEDIUM);
        aphids.affectedCrops = Arrays.asList("wheat", "mustard", "potato", "cotton", "chickpea");
        aphids.symptoms = Arrays.asList(
                "Yellowing and curling of leaves",
                "Sticky honeydew on leaves",
                "Stunted growth",
                "Sooty mold on leaves",
                "Presence of small green/black insects");
        aphids.treatments = Arrays.asList(
                "Spray Imidacloprid 17.8% SL @ 125 ml/ha",
                "Apply Dimethoate 30% EC @ 660 ml/ha",
                "Spray neem oil @ 5 ml/liter water",
                "Use soap solution (5g soap in 1 liter water)");
        aphids.preventiveMeasures = Arrays.asList(
                "Grow border crops like sorghum",
                "Spray water forcefully to dislodge aphids",
                "Encourage natural predators (ladybird beetles)",
                "Remove and destroy heavily infested plants",
                "Use yellow sticky traps");
        aphids.criticalAction = "Spray if aphid population > 20 per plant";
        DATABASE.put("aphids", aphids);

        PestDiseaseData whitefly = new PestDiseaseData("Whitefly", Type.PEST, Severity.HIGH);
        whitefly.affectedCrops = Arrays.asList("cotton", "tomato", "okra", "brinjal", "chili");
        whitefly.symptoms = Arrays.asList(
                "White flies on undersides of leaves",
                "Yellowing of leaves",
                "Leaf curling",
                "Honeydew secretion",
                "Transmission of viral diseases",
                "Reduced plant vigor");
        whitefly.treatments = Arrays.asList(
                "Spray Thiamethoxam 25% WG @ 100 g/ha",
                "Apply Acetamiprid 20% SP @ 50-100 g/ha",
                "Spray neem seed kernel extract (NSKE) @ 5%",
                "Use Beauveria bassiana (bio-pesticide)");
        whitefly.preventiveMeasures = Arrays.asList(
                "Use yellow sticky traps @ 15-20/ha",
                "Grow marigold as trap crop",
                "Avoid overlapping crops",
                "Remove weed hosts",
                "Use reflective mulches");
        whitefly.criticalAction = "Immediate spray if viral symptoms appear or population > 5 per leaf";
        DATABASE.put("whitefly", whitefly);

        PestDiseaseData bollworm = new PestDiseaseData("Bollworm", Type.PEST, Severity.CRITICAL);
        bollworm.affectedCrops = Arrays.asList("cotton", "chickpea", "pigeonpea", "tomato");
        bollworm.symptoms = Arrays.asList(
                "Holes in bolls/fruits",
                "Entry holes on squares and bolls",
                "Damaged and rotten fruits",
                "Larvae visible inside",
                "Flower drop");
        bollworm.treatments = Arrays.asList(
                "Spray Emamectin benzoate 5% SG @ 200 g/ha",
                "Apply Spinosad 45% SC @ 125 ml/ha",
                "Use Nuclear Polyhedrosis Virus (NPV) @ 250 LE/ha",
                "Spray Chlorantraniliprole 20% SC @ 150 ml/ha");
        bollworm.preventiveMeasures = Arrays.asList(
                "Install pheromone traps @ 12-15/ha",
                "Release Trichogramma @ 1 lakh/ha weekly",
                "Grow trap crops (marigold, castor)",
                "Deep ploughing after harvest",
                "Use Bt cotton varieties");
        bollworm.criticalAction = "URGENT: Spray within 24 hours if larval count > 2 per plant";
        DATABASE.put("bollworm", bollworm);

        // COMMON DISEASES

        PestDiseaseData blast = new PestDiseaseData("Blast", Type.DISEASE_FUNGAL, Severity.CRITICAL);
        blast.affectedCrops = Arrays.asList("rice");
        blast.symptoms = Arrays.asList(
                "Diamond-shaped lesions on leaves",
                "White to gray centers with brown margins",
                "Neck blast - rotting of panicle neck",
                "Severely affected plants may die",
                "Reduced grain filling");
        blast.treatments = Arrays.asList(
                "Spray Tricyclazole 75% WP @ 600 g/ha",
                "Apply Tebuconazole 50% + Trifloxystrobin 25% WG @ 300 g/ha",
                "Spray Isoprothiolane 40% EC @ 1.5 liters/ha",
                "Apply Carbendazim 50% WP @ 1 kg/ha");
        blast.preventiveMeasures = Arrays.asList(
                "Use resistant varieties",
                "Avoid excess nitrogen application",
                "Ensure proper drainage",
                "Maintain 2 sprays at tillering and panicle initiation",
                "Destroy infected plant debris");
        blast.criticalAction = "CRITICAL: Spray fungicide immediately if 5% plants show symptoms";
        DATABASE.put("blast", blast);

        PestDiseaseData lateBlight = new PestDiseaseData("Late Blight", Type.DISEASE_FUNGAL, Severity.CRITICAL);
        lateBlight.affectedCrops = Arrays.asList("potato", "tomato");
        lateBlight.symptoms = Arrays.asList(
                "Water-soaked lesions on leaves",
                "White fungal growth on leaf undersides",
                "Brown to black lesions on stems",
                "Tuber/fruit rot",
                "Rapid spread in moist conditions",
                "Entire field can be destroyed in days");
        lateBlight.treatments = Arrays.asList(
                "Spray Metalaxyl 8% + Mancozeb 64% WP @ 2.5 kg/ha",
                "Apply Cymoxanil 8% + Mancozeb 64% WP @ 2 kg/ha",
                "Spray Dimethomorph 50% WP @ 200 g/ha",
                "Apply Copper oxychloride 50% WP @ 2.5 kg/ha");
        lateBlight.preventiveMeasures = Arrays.asList(
                "Use certified disease-free seed",
                "Earthing up to protect tubers",
                "Prophylactic sprays every 7-10 days",
                "Remove volunteer plants",
                "Improve air circulation",
                "Avoid overhead irrigation");
        lateBlight.criticalAction = "EMERGENCY: Spray immediately and repeat every 5 days in epidemic conditions";
        DATABASE.put("late_blight", lateBlight);

        PestDiseaseData bacterialWilt = new PestDiseaseData("Bacterial Wilt", Type.DISEASE_BACTERIAL,
                Severity.CRITICAL);
        bacterialWilt.affectedCrops = Arrays.asList("tomato", "potato", "brinjal", "chili");
        bacterialWilt.symptoms = Arrays.asList(
                "Sudden wilting of plants",
                "Leaves remain green initially",
                "Milky bacterial ooze from cut stems",
                "Vascular browning",
                "Plant death within few days",
                "Disease spreads through soil and water");
        bacterialWilt.treatments = Arrays.asList(
                "No effective chemical control available",
                "Remove and burn infected plants immediately",
                "Drench soil with Streptocycline 100 ppm + Copper oxychloride",
                "Bio-control: Pseudomonas fluorescens @ 10 g/liter",
                "Soil solarization before planting");
        bacterialWilt.preventiveMeasures = Arrays.asList(
                "Crop rotation with non-host crops (3-4 years)",
                "Use resistant varieties",
                "Avoid water stagnation",
                "Deep summer ploughing",
                "Raised bed cultivation",
                "Drip irrigation instead of flood irrigation");
        bacterialWilt.criticalAction = "URGENT: Uproot and burn infected plants; quarantine area";
        DATABASE.put("bacterial_wilt", bacterialWilt);

        PestDiseaseData powderyMildew = new PestDiseaseData("Powdery Mildew", Type.DISEASE_FUNGAL, Severity.MEDIUM);
        powderyMildew.affectedCrops = Arrays.asList("wheat", "mango", "peas", "cucurbits");
        powderyMildew.symptoms = Arrays.asList(
                "White powdery coating on leaves",
                "Initially on upper leaf surfaces",
                "Yellowing and drying of leaves",
                "Reduced photosynthesis",
                "Premature leaf drop",
                "Stunted growth");
        powderyMildew.treatments = Arrays.asList(
                "Spray Sulfur 80% WP @ 2-3 kg/ha",
                "Apply Triadimefon 25% WP @ 500 g/ha",
                "Spray Propiconazole 25% EC @ 500 ml/ha",
                "Dust sulfur @ 20-25 kg/ha");
        powderyMildew.preventiveMeasures = Arrays.asList(
                "Avoid excess nitrogen",
                "Ensure proper plant spacing",
                "Remove infected plant parts",
                "Spray preventively in susceptible crops",
                "Use resistant varieties");
        powderyMildew.criticalAction = "Spray fungicide when 5-10% leaf area affected";
        DATABASE.put("powdery_mildew", powderyMildew);

        PestDiseaseData leafCurl = new PestDiseaseData("Leaf Curl Virus", Type.DISEASE_VIRAL, Severity.HIGH);
        leafCurl.affectedCrops = Arrays.asList("tomato", "chili", "cotton");
        leafCurl.symptoms = Arrays.asList(
                "Upward or downward curling of leaves",
                "Yellowing of leaf margins",
                "Stunted plant growth",
                "Reduced flowering and fruiting",
                "Leaf thickening",
                "Transmitted by whiteflies");
        leafCurl.treatments = Arrays.asList(
                "No direct viral cure available",
                "Control whitefly vector immediately",
                "Remove and destroy infected plants",
                "Spray Imidacloprid 17.8% SL to control vectors",
                "Use reflective mulches to repel whiteflies");
        leafCurl.preventiveMeasures = Arrays.asList(
                "Use virus-resistant varieties",
                "Transplant healthy seedlings only",
                "Yellow sticky traps for whiteflies",
                "Avoid planting near infected fields",
                "Border crops to filter whiteflies",
                "Rogue out infected plants early");
        leafCurl.criticalAction = "Remove infected plants immediately; spray for whiteflies";
        DATABASE.put("leaf_curl", leafCurl);
    }

    /**
     * Get pest/disease data
     */
    public static PestDiseaseData getData(String name) {
        return DATABASE.get(name.toLowerCase().replace(" ", "_"));
    }

    /**
     * Identify pest/disease by symptoms
     */
    public static List<String> identifyBySymptoms(List<String> symptoms) {
        List<String> matches = new ArrayList<>();

        for (Map.Entry<String, PestDiseaseData> entry : DATABASE.entrySet()) {
            PestDiseaseData data = entry.getValue();
            int matchCount = 0;

            for (String symptom : symptoms) {
                for (String knownSymptom : data.symptoms) {
                    if (knownSymptom.toLowerCase().contains(symptom.toLowerCase()) ||
                            symptom.toLowerCase().contains(knownSymptom.toLowerCase())) {
                        matchCount++;
                        break;
                    }
                }
            }

            if (matchCount >= 2) {
                matches.add(data.name + " (" + data.type + ") - " + matchCount + " symptoms match");
            }
        }

        return matches;
    }

    /**
     * Get treatment recommendations
     */
    public static List<String> getTreatment(String name, String cropName) {
        PestDiseaseData data = getData(name);
        if (data == null)
            return Arrays.asList("Unknown pest/disease");

        List<String> recommendations = new ArrayList<>();
        recommendations.add("IDENTIFIED: " + data.name + " (" + data.type + ")");
        recommendations.add("SEVERITY: " + data.severity);

        if (data.criticalAction != null) {
            recommendations.add(data.criticalAction);
        }

        recommendations.add("\nTREATMENTS:");
        recommendations.addAll(data.treatments);

        recommendations.add("\nPREVENTIVE MEASURES:");
        recommendations.addAll(data.preventiveMeasures);

        return recommendations;
    }

    /**
     * Get common pests for a crop
     */
    public static List<String> getCropPests(String cropName) {
        List<String> pests = new ArrayList<>();

        for (Map.Entry<String, PestDiseaseData> entry : DATABASE.entrySet()) {
            PestDiseaseData data = entry.getValue();
            if (data.affectedCrops.contains(cropName.toLowerCase())) {
                pests.add(data.name + " (" + data.severity + ")");
            }
        }

        return pests;
    }

    /**
     * Get all pest/disease names
     */
    public static List<String> getAllNames() {
        List<String> names = new ArrayList<>();
        for (PestDiseaseData data : DATABASE.values()) {
            names.add(data.name);
        }
        return names;
    }
}
