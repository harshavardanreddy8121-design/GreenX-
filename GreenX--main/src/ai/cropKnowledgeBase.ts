/**
 * Crop Cultivation Knowledge Base — trained from India Crop Cultivation Manual
 * Covers: Rice, Wheat, Maize, Cotton, Sugarcane, Pulses, Vegetables, Spices, Chili, Turmeric
 * Data includes: soil requirements, pest/disease profiles, fertilizer schedules,
 * irrigation needs, growth stages, economic data, and region-specific varieties.
 */

export interface CropProfile {
    name: string;
    aliases: string[];
    season: string[];
    regions: string[];
    soil: {
        type: string[];
        phMin: number;
        phMax: number;
        organicMatterPct: number;
        drainageNeeded: string;
    };
    nutrients: {
        nitrogenKgHa: number;
        phosphorusKgHa: number;
        potassiumKgHa: number;
        zincPpm?: number;
        boronPpm?: number;
        sulphurKgHa?: number;
    };
    irrigation: {
        method: string[];
        frequencyDays: number;
        criticalStages: string[];
        waterMmPerSeason: number;
    };
    growthStages: { stage: string; daysFromSowing: number; keyActivity: string }[];
    varieties: { name: string; region: string; duration: string; features: string }[];
    pests: PestProfile[];
    diseases: DiseaseProfile[];
    economics: {
        seedCostPerAcre: number;
        fertilizerCostPerAcre: number;
        labourCostPerAcre: number;
        expectedYieldKgPerAcre: number;
        mspPerQuintal: number;
        profitPerAcre: number;
        durationDays: number;
    };
    fertilizerSchedule: { stage: string; product: string; dosePerAcre: string; method: string }[];
    harvestIndicators: string[];
    storageNotes: string;
}

export interface PestProfile {
    name: string;
    type: 'insect' | 'mite' | 'nematode' | 'rodent' | 'bird';
    symptoms: string[];
    affectedStage: string[];
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    treatment: { chemical: string; dose: string; method: string; phi: string }[];
    bioControl: string;
    prevention: string[];
}

export interface DiseaseProfile {
    name: string;
    type: 'fungal' | 'bacterial' | 'viral';
    symptoms: string[];
    favorableConditions: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    treatment: { chemical: string; dose: string; method: string }[];
    prevention: string[];
}

export const CROP_DATABASE: CropProfile[] = [
    // ─────────────────────────────────────────── RICE ───────────────────────────
    {
        name: 'Rice',
        aliases: ['Paddy', 'Dhan', 'Oryza sativa'],
        season: ['Kharif', 'Rabi (irrigated)'],
        regions: ['Andhra Pradesh', 'Telangana', 'West Bengal', 'Tamil Nadu', 'Punjab', 'Uttar Pradesh', 'Bihar', 'Odisha', 'Assam', 'Karnataka'],
        soil: { type: ['Clay', 'Clay Loam', 'Alluvial'], phMin: 5.5, phMax: 7.0, organicMatterPct: 1.5, drainageNeeded: 'Standing water (puddled)' },
        nutrients: { nitrogenKgHa: 120, phosphorusKgHa: 60, potassiumKgHa: 40, zincPpm: 1.5, sulphurKgHa: 20 },
        irrigation: { method: ['Flood', 'Alternate Wetting & Drying'], frequencyDays: 3, criticalStages: ['Transplanting', 'Tillering', 'Panicle initiation', 'Flowering'], waterMmPerSeason: 1200 },
        growthStages: [
            { stage: 'Nursery', daysFromSowing: 0, keyActivity: 'Seed treatment with Carbendazim 2g/kg, sowing in raised beds' },
            { stage: 'Transplanting', daysFromSowing: 25, keyActivity: 'Transplant 2-3 seedlings/hill at 20×15cm spacing' },
            { stage: 'Tillering', daysFromSowing: 45, keyActivity: 'Apply 2nd split of N fertilizer, maintain 5cm water' },
            { stage: 'Panicle initiation', daysFromSowing: 65, keyActivity: 'Apply 3rd split N, ensure no water stress' },
            { stage: 'Flowering', daysFromSowing: 85, keyActivity: 'Maintain standing water, watch for blast disease' },
            { stage: 'Grain filling', daysFromSowing: 100, keyActivity: 'Drain field gradually, no nitrogen' },
            { stage: 'Maturity', daysFromSowing: 120, keyActivity: 'Harvest when 80% grains are golden' },
        ],
        varieties: [
            { name: 'BPT-5204 (Samba Mahsuri)', region: 'AP/Telangana', duration: '150 days', features: 'Fine grain, high demand' },
            { name: 'MTU-1010', region: 'AP/Telangana', duration: '120 days', features: 'Short duration, good yield' },
            { name: 'IR-64', region: 'All India', duration: '120 days', features: 'High yielding, blast resistant' },
            { name: 'Pusa Basmati-1', region: 'North India', duration: '135 days', features: 'Premium basmati quality' },
            { name: 'Swarna (MTU-7029)', region: 'Eastern India', duration: '140 days', features: 'Flood tolerant, high yield' },
        ],
        pests: [
            { name: 'Brown Plant Hopper (BPH)', type: 'insect', symptoms: ['Hopper burn', 'Circular yellowing patches', 'Honeydew on leaves'], affectedStage: ['Tillering', 'Flowering'], severity: 'CRITICAL', treatment: [{ chemical: 'Imidacloprid 17.8% SL', dose: '0.5 ml/litre', method: 'Foliar spray', phi: '14 days' }], bioControl: 'Release Lycosa spiders or Cyrtorhinus mirid bugs', prevention: ['Avoid excess N fertilizer', 'Drain standing water periodically', 'Use resistant varieties'] },
            { name: 'Stem Borer', type: 'insect', symptoms: ['Dead heart in vegetative stage', 'White ear in reproductive stage'], affectedStage: ['Tillering', 'Panicle initiation'], severity: 'HIGH', treatment: [{ chemical: 'Cartap Hydrochloride 4G', dose: '10 kg/acre', method: 'Broadcast in standing water', phi: '21 days' }], bioControl: 'Trichogramma egg parasitoid release', prevention: ['Clip nursery leaf tips before transplanting', 'Light traps for moth monitoring'] },
            { name: 'Leaf Folder', type: 'insect', symptoms: ['Longitudinal folding of leaves', 'White streaks on folded leaves'], affectedStage: ['Tillering', 'Flowering'], severity: 'MEDIUM', treatment: [{ chemical: 'Chlorantraniliprole 18.5% SC', dose: '0.3 ml/litre', method: 'Foliar spray', phi: '14 days' }], bioControl: 'Conserve natural enemies — spiders, dragonflies', prevention: ['Maintain field hygiene', 'Avoid excess nitrogen'] },
        ],
        diseases: [
            { name: 'Blast (Pyricularia oryzae)', type: 'fungal', symptoms: ['Diamond-shaped grey lesions on leaves', 'Neck rot at panicle base', 'Node blast'], favorableConditions: 'High humidity >90%, temperature 25-28°C, excess N', severity: 'CRITICAL', treatment: [{ chemical: 'Tricyclazole 75% WP', dose: '0.6 g/litre', method: 'Foliar spray' }, { chemical: 'Isoprothiolane 40% EC', dose: '1.5 ml/litre', method: 'Foliar spray' }], prevention: ['Use blast-resistant varieties', 'Balanced N fertilizer', 'Avoid late planting'] },
            { name: 'Bacterial Leaf Blight (BLB)', type: 'bacterial', symptoms: ['Yellow to white lesions from leaf tips', 'Wavy leaf margins', 'Milky ooze from cut lesion'], favorableConditions: 'Rainy season, wounds from wind damage', severity: 'HIGH', treatment: [{ chemical: 'Streptomycin sulphate + Copper oxychloride', dose: '0.5g + 3g/litre', method: 'Foliar spray' }], prevention: ['Use resistant varieties', 'Balanced nutrition', 'Proper drainage'] },
            { name: 'Sheath Blight', type: 'fungal', symptoms: ['Oval greenish-grey lesions on sheath', 'Irregular spots with dark margin', 'Lodging'], favorableConditions: 'Dense planting, high humidity, excess N', severity: 'HIGH', treatment: [{ chemical: 'Hexaconazole 5% EC', dose: '2 ml/litre', method: 'Foliar spray directed at sheath' }], prevention: ['Wider spacing', 'Reduce nitrogen', 'Remove sclerotia from field'] },
        ],
        economics: { seedCostPerAcre: 800, fertilizerCostPerAcre: 4500, labourCostPerAcre: 12000, expectedYieldKgPerAcre: 2500, mspPerQuintal: 2183, profitPerAcre: 25000, durationDays: 130 },
        fertilizerSchedule: [
            { stage: 'Basal (at transplanting)', product: 'DAP + MOP', dosePerAcre: '50kg DAP + 25kg MOP', method: 'Incorporate in puddled soil' },
            { stage: 'Tillering (25 DAT)', product: 'Urea', dosePerAcre: '25 kg', method: 'Broadcast in standing water' },
            { stage: 'Panicle initiation (50 DAT)', product: 'Urea + MOP', dosePerAcre: '20 kg Urea + 15 kg MOP', method: 'Broadcast' },
            { stage: 'Micronutrient spray', product: 'ZnSO4 + FeSO4', dosePerAcre: '2g + 5g per litre', method: 'Foliar spray at tillering' },
        ],
        harvestIndicators: ['80% grains turned golden', 'Grain moisture 20-22%', 'Leaf flag yellowed'],
        storageNotes: 'Dry to 14% moisture. Store in jute bags in well-ventilated godowns. Fumigate with Aluminium Phosphide if needed.',
    },

    // ─────────────────────────────────────────── WHEAT ──────────────────────────
    {
        name: 'Wheat',
        aliases: ['Gehun', 'Triticum aestivum'],
        season: ['Rabi'],
        regions: ['Punjab', 'Haryana', 'Uttar Pradesh', 'Madhya Pradesh', 'Rajasthan', 'Bihar', 'Gujarat'],
        soil: { type: ['Loam', 'Clay Loam', 'Sandy Loam'], phMin: 6.0, phMax: 7.5, organicMatterPct: 1.0, drainageNeeded: 'Well-drained' },
        nutrients: { nitrogenKgHa: 120, phosphorusKgHa: 60, potassiumKgHa: 40 },
        irrigation: { method: ['Flood', 'Sprinkler', 'Drip'], frequencyDays: 20, criticalStages: ['Crown Root Initiation (21 DAS)', 'Tillering', 'Jointing', 'Flowering', 'Milking'], waterMmPerSeason: 450 },
        growthStages: [
            { stage: 'Sowing', daysFromSowing: 0, keyActivity: 'Seed treatment with Vitavax 2g/kg, line sowing at 22.5cm row spacing' },
            { stage: 'Crown Root Initiation', daysFromSowing: 21, keyActivity: 'First irrigation — critical! Apply 1st top-dress N' },
            { stage: 'Tillering', daysFromSowing: 40, keyActivity: '2nd irrigation, apply remaining N, monitor aphids' },
            { stage: 'Jointing', daysFromSowing: 60, keyActivity: '3rd irrigation, weed management complete' },
            { stage: 'Flowering', daysFromSowing: 80, keyActivity: '4th irrigation, monitor for rust' },
            { stage: 'Milking/Dough', daysFromSowing: 100, keyActivity: '5th irrigation if needed, no late N' },
            { stage: 'Maturity', daysFromSowing: 130, keyActivity: 'Harvest when grain hard, moisture ~14%' },
        ],
        varieties: [
            { name: 'HD-2967', region: 'North-West Plains', duration: '145 days', features: 'High yield, rust resistant' },
            { name: 'PBW-343', region: 'Punjab/Haryana', duration: '140 days', features: 'Widely adapted' },
            { name: 'Lok-1', region: 'Central India (MP)', duration: '120 days', features: 'Heat tolerant late sown' },
            { name: 'DBW-187', region: 'North India', duration: '148 days', features: 'New high-yielding' },
        ],
        pests: [
            { name: 'Aphids (Sitobion avenae)', type: 'insect', symptoms: ['Curling of leaves', 'Honeydew deposition', 'Sooty mold', 'Shrivelled grains'], affectedStage: ['Tillering', 'Flowering', 'Milking'], severity: 'HIGH', treatment: [{ chemical: 'Dimethoate 30% EC', dose: '1.5 ml/litre', method: 'Foliar spray', phi: '14 days' }], bioControl: 'Ladybird beetles (Coccinellids) release', prevention: ['Timely sowing', 'Avoid excess N', 'Remove volunteer wheat'] },
            { name: 'Termites', type: 'insect', symptoms: ['Wilting plants', 'Hollowed-out stems at base', 'White ants on roots'], affectedStage: ['Sowing', 'Crown Root Initiation'], severity: 'HIGH', treatment: [{ chemical: 'Chlorpyriphos 20% EC', dose: '4 ml/litre', method: 'Soil drench', phi: '30 days' }], bioControl: 'Neem cake in FYM', prevention: ['Apply well-decomposed FYM only', 'Adequate irrigation'] },
        ],
        diseases: [
            { name: 'Yellow Rust (Stripe Rust)', type: 'fungal', symptoms: ['Yellow-orange pustules in stripes on leaves', 'Premature drying'], favorableConditions: 'Cool (10-15°C), humid weather, cloudy days', severity: 'CRITICAL', treatment: [{ chemical: 'Propiconazole 25% EC', dose: '1 ml/litre', method: 'Foliar spray' }], prevention: ['Grow resistant varieties (HD-2967)', 'Early sowing', 'Avoid late N'] },
            { name: 'Loose Smut', type: 'fungal', symptoms: ['Entire ear head replaced by black sooty mass', 'Spores dispersed by wind'], favorableConditions: 'Infected seed', severity: 'MEDIUM', treatment: [{ chemical: 'Vitavax (Carboxin 75% WP)', dose: '2g/kg seed', method: 'Seed treatment' }], prevention: ['Use certified disease-free seed', 'Seed treatment before sowing'] },
            { name: 'Karnal Bunt', type: 'fungal', symptoms: ['Partially bunted grains with fishy smell', 'Black powder in grains'], favorableConditions: 'Rain during flowering', severity: 'MEDIUM', treatment: [{ chemical: 'Propiconazole 25% EC', dose: '1 ml/litre', method: 'Spray at boot stage' }], prevention: ['Use clean seed', 'Avoid late sowing'] },
        ],
        economics: { seedCostPerAcre: 1500, fertilizerCostPerAcre: 4000, labourCostPerAcre: 8000, expectedYieldKgPerAcre: 2000, mspPerQuintal: 2275, profitPerAcre: 22000, durationDays: 135 },
        fertilizerSchedule: [
            { stage: 'Basal (at sowing)', product: 'DAP + MOP', dosePerAcre: '50kg DAP + 25kg MOP', method: 'Drill in furrows' },
            { stage: 'CRI (21 DAS)', product: 'Urea', dosePerAcre: '30 kg', method: 'Broadcast before irrigation' },
            { stage: 'Tillering (40 DAS)', product: 'Urea', dosePerAcre: '20 kg', method: 'Broadcast' },
        ],
        harvestIndicators: ['Straw turns golden yellow', 'Grain is hard and cannot be dented with thumbnail', 'Moisture ~12-14%'],
        storageNotes: 'Store in moisture-proof gunny bags at <12% moisture. Use Aluminium Phosphide fumigation.',
    },

    // ─────────────────────────────────────────── MAIZE ──────────────────────────
    {
        name: 'Maize',
        aliases: ['Corn', 'Makka', 'Zea mays'],
        season: ['Kharif', 'Rabi', 'Spring'],
        regions: ['Karnataka', 'Madhya Pradesh', 'Rajasthan', 'Bihar', 'Andhra Pradesh', 'Telangana', 'Tamil Nadu', 'Maharashtra'],
        soil: { type: ['Sandy Loam', 'Loam', 'Clay Loam'], phMin: 5.5, phMax: 7.5, organicMatterPct: 1.0, drainageNeeded: 'Well-drained (waterlogging kills)' },
        nutrients: { nitrogenKgHa: 150, phosphorusKgHa: 75, potassiumKgHa: 40, zincPpm: 2.0 },
        irrigation: { method: ['Furrow', 'Drip', 'Sprinkler'], frequencyDays: 8, criticalStages: ['Knee-high stage', 'Tasselling', 'Silking', 'Grain filling'], waterMmPerSeason: 600 },
        growthStages: [
            { stage: 'Sowing', daysFromSowing: 0, keyActivity: 'Seed treatment with Imidacloprid, dibbling at 60×20cm' },
            { stage: 'Germination', daysFromSowing: 7, keyActivity: 'Ensure uniform stand, gap filling' },
            { stage: 'Knee-high', daysFromSowing: 30, keyActivity: 'Top-dress N fertilizer, earthing up, weed control' },
            { stage: 'Tasselling', daysFromSowing: 55, keyActivity: 'Final N dose, ensure adequate irrigation' },
            { stage: 'Silking', daysFromSowing: 60, keyActivity: 'Critical water requirement — no stress!' },
            { stage: 'Grain filling', daysFromSowing: 80, keyActivity: 'Monitor stem borer, FAW; maintain irrigation' },
            { stage: 'Maturity', daysFromSowing: 100, keyActivity: 'Harvest when husk brown, black layer on grain' },
        ],
        varieties: [
            { name: 'NK-6240 (Syngenta)', region: 'All India', duration: '105 days', features: 'High yield hybrid 30-35 q/acre' },
            { name: 'Pioneer 30V92', region: 'South India', duration: '110 days', features: 'Drought tolerant' },
            { name: 'DHM-117', region: 'AP/Telangana', duration: '105 days', features: 'Public sector, good grain' },
            { name: 'Bio-9681', region: 'Karnataka', duration: '110 days', features: 'Stay-green trait' },
        ],
        pests: [
            { name: 'Fall Armyworm (FAW)', type: 'insect', symptoms: ['Ragged feeding on whorl leaves', 'Windowing on young leaves', 'Frass in whorl', 'Large caterpillar with inverted Y on head'], affectedStage: ['Germination', 'Knee-high', 'Tasselling'], severity: 'CRITICAL', treatment: [{ chemical: 'Emamectin benzoate 5% SG', dose: '0.4 g/litre', method: 'Spray directed into whorl', phi: '14 days' }, { chemical: 'Spinetoram 11.7% SC', dose: '0.5 ml/litre', method: 'Foliar spray', phi: '7 days' }], bioControl: 'Release Trichogramma + sprinkle sand+lime into whorl', prevention: ['Early sowing', 'Pheromone traps 5/acre', 'Neem seed kernel extract 5%'] },
            { name: 'Stem Borer (Chilo partellus)', type: 'insect', symptoms: ['Dead heart in young plants', 'Bore holes in stem', 'Frass from bore holes'], affectedStage: ['Knee-high', 'Tasselling'], severity: 'HIGH', treatment: [{ chemical: 'Carbofuran 3G', dose: '4 kg/acre', method: 'Whorl application', phi: '30 days' }], bioControl: 'Trichogramma chilonis release at 50,000/acre', prevention: ['Destroy crop residues', 'Timely sowing', 'Intercrop with cowpea'] },
        ],
        diseases: [
            { name: 'Turcicum Leaf Blight', type: 'fungal', symptoms: ['Long cigar-shaped grey-green lesions on leaves', 'Starts from lower leaves'], favorableConditions: 'Cool humid weather, dense planting', severity: 'HIGH', treatment: [{ chemical: 'Mancozeb 75% WP', dose: '2.5 g/litre', method: 'Foliar spray' }], prevention: ['Resistant hybrids', 'Crop rotation', 'Proper spacing'] },
            { name: 'Downy Mildew (Crazy top)', type: 'fungal', symptoms: ['Chlorotic stripes on leaves', 'Abnormal tassel growth', 'Leafy outgrowth from cobs'], favorableConditions: 'High humidity, waterlogged fields', severity: 'HIGH', treatment: [{ chemical: 'Metalaxyl 35% WS', dose: '2g/kg seed', method: 'Seed treatment' }], prevention: ['Seed treatment mandatory', 'Good drainage', 'Resistant varieties'] },
        ],
        economics: { seedCostPerAcre: 3000, fertilizerCostPerAcre: 5000, labourCostPerAcre: 8000, expectedYieldKgPerAcre: 3000, mspPerQuintal: 2090, profitPerAcre: 30000, durationDays: 105 },
        fertilizerSchedule: [
            { stage: 'Basal', product: 'DAP + MOP + ZnSO4', dosePerAcre: '50kg DAP + 25kg MOP + 10kg ZnSO4', method: 'Band placement' },
            { stage: 'Knee-high (25 DAS)', product: 'Urea', dosePerAcre: '40 kg', method: 'Side dress + earthing up' },
            { stage: 'Tasselling (50 DAS)', product: 'Urea', dosePerAcre: '30 kg', method: 'Side dress' },
        ],
        harvestIndicators: ['Husk turns brown/dry', 'Black layer visible on grain base', 'Grain moisture ~20-25%'],
        storageNotes: 'Dry cobs to 12% moisture. Shell and store. Use hermetic bags for small farmers.',
    },

    // ─────────────────────────────────────────── COTTON ─────────────────────────
    {
        name: 'Cotton',
        aliases: ['Kapas', 'Gossypium'],
        season: ['Kharif'],
        regions: ['Gujarat', 'Maharashtra', 'Telangana', 'Andhra Pradesh', 'Madhya Pradesh', 'Rajasthan', 'Haryana', 'Punjab', 'Karnataka'],
        soil: { type: ['Black Cotton (Vertisol)', 'Alluvial', 'Sandy Loam'], phMin: 6.0, phMax: 8.0, organicMatterPct: 0.8, drainageNeeded: 'Well-drained (sensitive to waterlogging)' },
        nutrients: { nitrogenKgHa: 120, phosphorusKgHa: 60, potassiumKgHa: 60, sulphurKgHa: 20, boronPpm: 1.0 },
        irrigation: { method: ['Drip', 'Furrow'], frequencyDays: 12, criticalStages: ['Squaring', 'Flowering', 'Boll development'], waterMmPerSeason: 700 },
        growthStages: [
            { stage: 'Sowing', daysFromSowing: 0, keyActivity: 'Bt-Cotton seed dibbling at 90×60cm, treat with Imidacloprid' },
            { stage: 'Emergence', daysFromSowing: 7, keyActivity: 'Gap fill within 15 days, thin to 1 plant/hill' },
            { stage: 'Squaring', daysFromSowing: 45, keyActivity: 'Start IPM scouting, first top-dress N' },
            { stage: 'Flowering', daysFromSowing: 65, keyActivity: 'Peak water demand, apply K, monitor bollworm' },
            { stage: 'Boll development', daysFromSowing: 90, keyActivity: 'Continue monitoring, avoid excess N' },
            { stage: 'Boll opening', daysFromSowing: 120, keyActivity: 'Stop irrigation 2 weeks before picking' },
            { stage: 'First picking', daysFromSowing: 140, keyActivity: 'Manual picking of open bolls, avoid trash' },
            { stage: 'Final pick', daysFromSowing: 170, keyActivity: 'Clean picking, destroy stalks after' },
        ],
        varieties: [
            { name: 'Bollgard II (Various)', region: 'All India', duration: '160-180 days', features: 'Bt hybrid, bollworm resistant' },
            { name: 'RCH-2 Bt', region: 'Central India', duration: '170 days', features: 'Good fibre quality' },
            { name: 'NCS-145 Bt', region: 'AP/Telangana', duration: '160 days', features: 'Sucking pest tolerant' },
            { name: 'Suraj Bt', region: 'Gujarat/Maharashtra', duration: '165 days', features: 'Drought tolerant' },
        ],
        pests: [
            { name: 'American Bollworm (Helicoverpa)', type: 'insect', symptoms: ['Bore holes in bolls & squares', 'Frass exuding from bolls', 'Premature boll drop'], affectedStage: ['Squaring', 'Flowering', 'Boll development'], severity: 'CRITICAL', treatment: [{ chemical: 'Emamectin benzoate 5% SG', dose: '0.4 g/litre', method: 'Foliar spray', phi: '14 days' }], bioControl: 'HaNPV virus spray at 250 LE/acre + Trichogramma', prevention: ['Bt cotton varieties', 'Pheromone traps', 'Refuge planting (non-Bt border)'] },
            { name: 'Pink Bollworm', type: 'insect', symptoms: ['Rosetted flowers', 'Inter-locular boring in bolls', 'Stained lint'], affectedStage: ['Flowering', 'Boll development'], severity: 'CRITICAL', treatment: [{ chemical: 'Cypermethrin 25% EC', dose: '1 ml/litre', method: 'Foliar spray', phi: '14 days' }], bioControl: 'Mass pheromone trapping', prevention: ['Destroy crop residues early', 'Timely sowing', 'Short duration varieties'] },
            { name: 'Whitefly (Bemisia tabaci)', type: 'insect', symptoms: ['Yellowing of leaves', 'Sticky honeydew', 'Cotton Leaf Curl Virus transmission'], affectedStage: ['Squaring', 'Flowering'], severity: 'HIGH', treatment: [{ chemical: 'Diafenthiuron 50% WP', dose: '1.2 g/litre', method: 'Under-leaf spray', phi: '14 days' }], bioControl: 'Encarsia formosa parasitoid', prevention: ['Avoid excess nitrogen', 'Yellow sticky traps', 'Remove alternate host weeds'] },
        ],
        diseases: [
            { name: 'Cotton Leaf Curl Virus (CLCuV)', type: 'viral', symptoms: ['Upward leaf curling', 'Thickened dark green veins', 'Enations on underside', 'Stunted growth'], favorableConditions: 'Whitefly vector population, late sowing', severity: 'CRITICAL', treatment: [{ chemical: 'No cure — manage whitefly vector', dose: '', method: 'Vector control' }], prevention: ['Resistant/tolerant varieties', 'Timely sowing', 'Whitefly management', 'Remove infected plants early'] },
            { name: 'Bacterial Blight (Angular leaf spot)', type: 'bacterial', symptoms: ['Water-soaked angular spots on leaves', 'Black arm on stems', 'Boll rot'], favorableConditions: 'Rainy season, warm humid weather', severity: 'HIGH', treatment: [{ chemical: 'Copper hydroxide 77% WP', dose: '2 g/litre', method: 'Foliar spray' }], prevention: ['Acid-delinted seed', 'Resistant varieties', 'Crop rotation'] },
        ],
        economics: { seedCostPerAcre: 1500, fertilizerCostPerAcre: 5000, labourCostPerAcre: 15000, expectedYieldKgPerAcre: 800, mspPerQuintal: 6620, profitPerAcre: 28000, durationDays: 170 },
        fertilizerSchedule: [
            { stage: 'Basal', product: 'DAP + MOP + Sulphur', dosePerAcre: '50kg DAP + 20kg MOP + 10kg S', method: 'Band placement' },
            { stage: 'Squaring (45 DAS)', product: 'Urea + MOP', dosePerAcre: '30kg Urea + 15kg MOP', method: 'Side dress' },
            { stage: 'Flowering (65 DAS)', product: 'Urea', dosePerAcre: '20 kg', method: 'Side dress' },
            { stage: 'Boll dev (90 DAS)', product: 'KNO3 foliar', dosePerAcre: '10g/litre', method: 'Foliar spray for boll weight' },
        ],
        harvestIndicators: ['Bolls fully open', 'Lint fluffy and white', 'Pick in morning after dew dries'],
        storageNotes: 'Store kapas in jute bags, moisture <8%. Avoid floor contact. Keep dry and ventilated.',
    },

    // ─────────────────────────────────────────── SUGARCANE ──────────────────────
    {
        name: 'Sugarcane',
        aliases: ['Ganna', 'Saccharum officinarum'],
        season: ['Annual (Oct-Nov or Feb-Mar planting)'],
        regions: ['Uttar Pradesh', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Andhra Pradesh', 'Gujarat', 'Bihar'],
        soil: { type: ['Loam', 'Clay Loam', 'Alluvial'], phMin: 6.0, phMax: 8.0, organicMatterPct: 1.0, drainageNeeded: 'Well-drained, no waterlogging' },
        nutrients: { nitrogenKgHa: 250, phosphorusKgHa: 100, potassiumKgHa: 100 },
        irrigation: { method: ['Furrow', 'Drip'], frequencyDays: 10, criticalStages: ['Germination', 'Tillering', 'Grand growth', 'Ripening (reduce)'], waterMmPerSeason: 2000 },
        growthStages: [
            { stage: 'Planting', daysFromSowing: 0, keyActivity: 'Plant 2-3 bud setts in furrows at 75cm row spacing' },
            { stage: 'Germination', daysFromSowing: 30, keyActivity: 'Gap filling with pre-sprouted setts' },
            { stage: 'Tillering', daysFromSowing: 90, keyActivity: 'Top-dress N, earthing up, de-trashing' },
            { stage: 'Grand Growth', daysFromSowing: 150, keyActivity: 'Heavy N demand, regular irrigation' },
            { stage: 'Maturity', daysFromSowing: 300, keyActivity: 'Withhold irrigation, apply ripener if needed' },
            { stage: 'Harvest', daysFromSowing: 360, keyActivity: 'Cut at ground level, ratoon management' },
        ],
        varieties: [
            { name: 'Co 0238', region: 'UP/Bihar', duration: '12 months', features: 'High sucrose, early maturing' },
            { name: 'Co 86032', region: 'Maharashtra/Karnataka', duration: '14 months', features: 'High yield, good ratoon' },
            { name: 'CoC 671', region: 'Tamil Nadu', duration: '12 months', features: 'Drought tolerant' },
        ],
        pests: [
            { name: 'Early Shoot Borer', type: 'insect', symptoms: ['Dead hearts in tillering phase', 'Bore holes in young shoots'], affectedStage: ['Germination', 'Tillering'], severity: 'HIGH', treatment: [{ chemical: 'Chlorantraniliprole 0.4% GR', dose: '10 kg/acre', method: 'Soil application in furrows', phi: '60 days' }], bioControl: 'Trichogramma release at tillering', prevention: ['Remove dead hearts promptly', 'Proper irrigation schedule', 'Light traps'] },
            { name: 'Woolly Aphid', type: 'insect', symptoms: ['White woolly masses on leaf undersides', 'Honeydew and sooty mold', 'Leaf yellowing'], affectedStage: ['Grand Growth'], severity: 'MEDIUM', treatment: [{ chemical: 'Thiamethoxam 25% WG', dose: '0.3 g/litre', method: 'Foliar spray', phi: '14 days' }], bioControl: 'Dipha aphidivora predator release', prevention: ['Adequate spacing', 'Balanced N', 'Conserve natural enemies'] },
        ],
        diseases: [
            { name: 'Red Rot', type: 'fungal', symptoms: ['Reddening of internal tissue', 'Acrid alcoholic smell from stalks', 'White patches in red tissue'], favorableConditions: 'Waterlogged soil, high humidity', severity: 'CRITICAL', treatment: [{ chemical: 'No effective chemical control', dose: '', method: 'Remove & destroy infected clumps' }], prevention: ['Resistant varieties (Co 0238)', 'Use disease-free setts', 'Hot water treatment of setts (50°C, 2 hrs)'] },
        ],
        economics: { seedCostPerAcre: 5000, fertilizerCostPerAcre: 8000, labourCostPerAcre: 20000, expectedYieldKgPerAcre: 35000, mspPerQuintal: 315, profitPerAcre: 55000, durationDays: 360 },
        fertilizerSchedule: [
            { stage: 'Basal', product: 'FYM + SSP + MOP', dosePerAcre: '5t FYM + 75kg SSP + 40kg MOP', method: 'In furrows before planting' },
            { stage: 'Tillering (60 DAS)', product: 'Urea', dosePerAcre: '50 kg', method: 'Side dress + earthing' },
            { stage: 'Grand Growth (120 DAS)', product: 'Urea + MOP', dosePerAcre: '50kg Urea + 30kg MOP', method: 'Side dress + earthing' },
        ],
        harvestIndicators: ['Brix reading >18%', 'Sucrose content >10%', 'Lower leaves dried'],
        storageNotes: 'Mill within 24-48 hours of harvest. No prolonged field storage.',
    },

    // ─────────────────────────────────────────── CHILI (MIRCHI) ──────────────────
    {
        name: 'Chili',
        aliases: ['Mirchi', 'Red Chili', 'Green Chili', 'Capsicum annuum'],
        season: ['Kharif', 'Rabi'],
        regions: ['Andhra Pradesh', 'Telangana', 'Karnataka', 'Maharashtra', 'Madhya Pradesh', 'Tamil Nadu', 'Rajasthan'],
        soil: { type: ['Loam', 'Sandy Loam', 'Black soil'], phMin: 6.0, phMax: 7.5, organicMatterPct: 1.5, drainageNeeded: 'Well-drained (water-sensitive)' },
        nutrients: { nitrogenKgHa: 120, phosphorusKgHa: 60, potassiumKgHa: 80, sulphurKgHa: 20 },
        irrigation: { method: ['Drip', 'Furrow'], frequencyDays: 5, criticalStages: ['Transplanting', 'Flowering', 'Fruit development'], waterMmPerSeason: 800 },
        growthStages: [
            { stage: 'Nursery', daysFromSowing: 0, keyActivity: 'Sow in raised beds with FYM, treat seed with Trichoderma' },
            { stage: 'Transplanting', daysFromSowing: 40, keyActivity: 'Transplant at 60×45cm spacing, drip irrigation setup' },
            { stage: 'Vegetative', daysFromSowing: 70, keyActivity: 'Top-dress N & K, stake if needed' },
            { stage: 'Flowering', daysFromSowing: 90, keyActivity: 'Ensure no water stress, spray micronutrients' },
            { stage: 'Fruit setting', daysFromSowing: 100, keyActivity: 'Monitor thrips/mites, potash foliar spray' },
            { stage: 'Harvest begins', daysFromSowing: 120, keyActivity: 'Pick red ripe fruits for dry chili' },
            { stage: 'Final harvest', daysFromSowing: 180, keyActivity: 'Multiple pickings continue up to 6 months' },
        ],
        varieties: [
            { name: 'Teja (S-17)', region: 'AP/Telangana', duration: '180 days', features: 'High pungency, export quality' },
            { name: 'Byadgi (Kaddi)', region: 'Karnataka', duration: '200 days', features: 'High colour value, low pungency' },
            { name: 'LCA-334', region: 'Guntur/AP', duration: '170 days', features: 'High yielding, dual purpose' },
            { name: 'Pusa Jwala', region: 'All India', duration: '150 days', features: 'Long fruit, high yield' },
        ],
        pests: [
            { name: 'Thrips (Scirtothrips dorsalis)', type: 'insect', symptoms: ['Leaf curling upward', 'Silvery sheen on leaves', 'Flower drop', 'Chili leaf curl'], affectedStage: ['Vegetative', 'Flowering'], severity: 'CRITICAL', treatment: [{ chemical: 'Fipronil 5% SC', dose: '1.5 ml/litre', method: 'Foliar spray', phi: '10 days' }, { chemical: 'Spinetoram 11.7% SC', dose: '0.5 ml/litre', method: 'Foliar spray', phi: '7 days' }], bioControl: 'Predatory mites (Amblyseius)', prevention: ['Blue sticky traps 20/acre', 'Neem oil spray 2%', 'Avoid mono-cropping'] },
            { name: 'Fruit Borer (Helicoverpa)', type: 'insect', symptoms: ['Bore holes in fruits', 'Fruits with frass', 'Rotting fruits'], affectedStage: ['Fruit setting'], severity: 'HIGH', treatment: [{ chemical: 'Chlorantraniliprole 18.5% SC', dose: '0.3 ml/litre', method: 'Foliar spray', phi: '3 days' }], bioControl: 'HaNPV spray', prevention: ['Pheromone traps 5/acre', 'Neem oil', 'Bird perches in field'] },
            { name: 'Mites (Polyphagotarsonemus)', type: 'mite', symptoms: ['Downward leaf curl', 'Bronzing of leaves', 'Stunted new growth'], affectedStage: ['Vegetative', 'Flowering'], severity: 'HIGH', treatment: [{ chemical: 'Propargite 57% EC', dose: '2 ml/litre', method: 'Under-leaf spray', phi: '14 days' }], bioControl: 'Predatory mite release', prevention: ['Wettable sulphur spray', 'Avoid water stress'] },
        ],
        diseases: [
            { name: 'Anthracnose (Die-back)', type: 'fungal', symptoms: ['Dark sunken lesions on fruits', 'Die-back of branches from tips', 'Fruit rot'], favorableConditions: 'Warm humid weather, rain splash', severity: 'HIGH', treatment: [{ chemical: 'Carbendazim 50% WP', dose: '1 g/litre', method: 'Foliar spray' }, { chemical: 'Mancozeb 75% WP', dose: '2.5 g/litre', method: 'Preventive spray' }], prevention: ['Seed treatment', 'Crop rotation', 'Remove infected debris'] },
            { name: 'Powdery Mildew', type: 'fungal', symptoms: ['White powder on leaf surface', 'Leaf yellowing and drop'], favorableConditions: 'Dry weather, moderate temperature', severity: 'MEDIUM', treatment: [{ chemical: 'Hexaconazole 5% EC', dose: '2 ml/litre', method: 'Foliar spray' }], prevention: ['Proper spacing', 'Balanced nutrition'] },
            { name: 'Murda Complex (Leaf curl virus)', type: 'viral', symptoms: ['Severe leaf curl', 'Stunting', 'No fruiting', 'Transmitted by thrips & mites'], favorableConditions: 'High thrips/mite population', severity: 'CRITICAL', treatment: [{ chemical: 'No cure — manage vectors', dose: '', method: 'Remove and destroy infected plants' }], prevention: ['Vector control (thrips/mites)', 'Resistant varieties', 'Barrier crops with maize'] },
        ],
        economics: { seedCostPerAcre: 2000, fertilizerCostPerAcre: 6000, labourCostPerAcre: 25000, expectedYieldKgPerAcre: 1500, mspPerQuintal: 8000, profitPerAcre: 60000, durationDays: 180 },
        fertilizerSchedule: [
            { stage: 'Basal', product: 'FYM + DAP + MOP', dosePerAcre: '3t FYM + 50kg DAP + 30kg MOP', method: 'Broadcast & incorporate' },
            { stage: 'Vegetative (30 DAT)', product: 'Urea + MOP', dosePerAcre: '25kg Urea + 15kg MOP', method: 'Drip fertigation or side dress' },
            { stage: 'Flowering (60 DAT)', product: 'Urea + SOP', dosePerAcre: '20kg Urea + 20kg SOP', method: 'Fertigation' },
            { stage: 'Fruit setting (90 DAT)', product: '19:19:19 + Ca', dosePerAcre: '5g/litre + CaNO3 5g/litre', method: 'Foliar spray' },
        ],
        harvestIndicators: ['Fruits fully red and firm', 'Easy detachment from stem', 'For dry chili: sun-dry to 10% moisture'],
        storageNotes: 'Sun-dry for 5-7 days, store in gunny bags at <10% moisture. Cold storage for green chili at 7-10°C.',
    },

    // ─────────────────────────────────────────── TURMERIC ───────────────────────
    {
        name: 'Turmeric',
        aliases: ['Haldi', 'Pasupu', 'Curcuma longa'],
        season: ['Kharif (June-July planting)'],
        regions: ['Telangana', 'Andhra Pradesh', 'Tamil Nadu', 'Maharashtra', 'Odisha', 'Karnataka', 'Assam'],
        soil: { type: ['Sandy Loam', 'Clay Loam', 'Red soil'], phMin: 5.5, phMax: 7.5, organicMatterPct: 2.0, drainageNeeded: 'Well-drained, rich in organic matter' },
        nutrients: { nitrogenKgHa: 120, phosphorusKgHa: 60, potassiumKgHa: 120 },
        irrigation: { method: ['Drip', 'Furrow', 'Sprinkler'], frequencyDays: 7, criticalStages: ['Rhizome initiation', 'Bulking', 'Active growth'], waterMmPerSeason: 1500 },
        growthStages: [
            { stage: 'Planting', daysFromSowing: 0, keyActivity: 'Plant mother/finger rhizomes at 30×20cm, mulch heavily' },
            { stage: 'Sprouting', daysFromSowing: 30, keyActivity: 'Remove dead mulch, gap filling' },
            { stage: 'Active growth', daysFromSowing: 90, keyActivity: 'Top-dress N, earthing up, weed control' },
            { stage: 'Rhizome initiation', daysFromSowing: 120, keyActivity: 'Apply K fertilizer, maintain moisture' },
            { stage: 'Bulking', daysFromSowing: 180, keyActivity: 'Maximum nutrient uptake, no water stress' },
            { stage: 'Maturity', daysFromSowing: 270, keyActivity: 'Leaves dry, harvest when aerial parts wilt' },
        ],
        varieties: [
            { name: 'Erode Local', region: 'Tamil Nadu', duration: '270 days', features: 'High curcumin content' },
            { name: 'Salem', region: 'Tamil Nadu', duration: '250 days', features: 'Bright yellow colour' },
            { name: 'Duggirala', region: 'AP', duration: '270 days', features: 'High yield, good colour' },
            { name: 'Pragati', region: 'All India', duration: '240 days', features: 'Short duration, 5% curcumin' },
        ],
        pests: [
            { name: 'Shoot Borer (Conogethes punctiferalis)', type: 'insect', symptoms: ['Bore holes in pseudostem', 'Frass from bore holes', 'Yellowing of central shoot', 'Dead heart'], affectedStage: ['Active growth', 'Rhizome initiation'], severity: 'HIGH', treatment: [{ chemical: 'Chlorantraniliprole 18.5% SC', dose: '0.3 ml/litre', method: 'Spray at base', phi: '14 days' }], bioControl: 'Trichogramma release', prevention: ['Light traps', 'Destroy affected shoots', 'Timely earthing up'] },
            { name: 'Scale Insect', type: 'insect', symptoms: ['White scales on rhizome surface', 'Shrivelled stored rhizomes'], affectedStage: ['Maturity'], severity: 'MEDIUM', treatment: [{ chemical: 'Dimethoate 30% EC', dose: '2 ml/litre', method: 'Drench on rhizomes', phi: '—' }], bioControl: 'None established', prevention: ['Use pest-free rhizomes for planting', 'Hot water treatment of seed material'] },
        ],
        diseases: [
            { name: 'Rhizome Rot (Pythium)', type: 'fungal', symptoms: ['Wilting and yellowing from lower leaves', 'Soft rotting of rhizomes', 'Foul smell from base'], favorableConditions: 'Waterlogging, poor drainage', severity: 'CRITICAL', treatment: [{ chemical: 'Metalaxyl + Mancozeb (Ridomil Gold)', dose: '2.5 g/litre', method: 'Soil drench around base' }], prevention: ['Good drainage', 'Trichoderma seed treatment', 'Raised beds'] },
            { name: 'Leaf Spot (Colletotrichum)', type: 'fungal', symptoms: ['Brown oval spots on leaves', 'Spots with concentric rings', 'Leaf drying from tips'], favorableConditions: 'Humid weather, dense canopy', severity: 'MEDIUM', treatment: [{ chemical: 'Mancozeb 75% WP', dose: '2.5 g/litre', method: 'Foliar spray' }], prevention: ['Proper spacing', 'Remove fallen leaves', 'Mulching'] },
        ],
        economics: { seedCostPerAcre: 15000, fertilizerCostPerAcre: 6000, labourCostPerAcre: 30000, expectedYieldKgPerAcre: 8000, mspPerQuintal: 1500, profitPerAcre: 50000, durationDays: 270 },
        fertilizerSchedule: [
            { stage: 'Basal', product: 'FYM + Neem cake + SSP', dosePerAcre: '5t FYM + 200kg Neem cake + 50kg SSP', method: 'Mix in soil before planting' },
            { stage: 'Active growth (60 DAS)', product: 'Urea + MOP', dosePerAcre: '30kg Urea + 25kg MOP', method: 'Side dress + earthing' },
            { stage: 'Rhizome init (120 DAS)', product: 'Urea + MOP', dosePerAcre: '25kg Urea + 30kg MOP', method: 'Side dress + earthing' },
        ],
        harvestIndicators: ['Aerial parts completely dry and wilted', 'Rhizomes firm and aromatic', '8-9 months after planting'],
        storageNotes: 'Boil fresh rhizomes for 45 min, sun-dry for 10-15 days to <10% moisture. Polish in drums.',
    },

    // ─────────────────────────────────────────── PULSES (PIGEON PEA) ────────────
    {
        name: 'Pigeon Pea (Red Gram)',
        aliases: ['Arhar', 'Tur Dal', 'Cajanus cajan'],
        season: ['Kharif'],
        regions: ['Maharashtra', 'Karnataka', 'Madhya Pradesh', 'Uttar Pradesh', 'Telangana', 'Andhra Pradesh', 'Gujarat'],
        soil: { type: ['Sandy Loam', 'Loam', 'Red Soil'], phMin: 6.0, phMax: 7.5, organicMatterPct: 0.8, drainageNeeded: 'Well-drained (very sensitive to waterlogging)' },
        nutrients: { nitrogenKgHa: 20, phosphorusKgHa: 50, potassiumKgHa: 20, sulphurKgHa: 20 },
        irrigation: { method: ['Furrow', 'Drip'], frequencyDays: 15, criticalStages: ['Flowering', 'Pod filling'], waterMmPerSeason: 350 },
        growthStages: [
            { stage: 'Sowing', daysFromSowing: 0, keyActivity: 'Treat seed with Rhizobium + Trichoderma, sow at 60×20cm' },
            { stage: 'Vegetative', daysFromSowing: 60, keyActivity: 'Weed control, one light irrigation' },
            { stage: 'Flowering', daysFromSowing: 100, keyActivity: 'Critical stage — no water stress, monitor Helicoverpa' },
            { stage: 'Pod filling', daysFromSowing: 130, keyActivity: 'Spray for pod borer, maintain moisture' },
            { stage: 'Maturity', daysFromSowing: 160, keyActivity: 'Harvest when 75% pods turn brown' },
        ],
        varieties: [
            { name: 'Asha (ICPL-87119)', region: 'All India', duration: '180 days', features: 'Wilt resistant, high yield' },
            { name: 'ICPL-88039', region: 'Central India', duration: '140 days', features: 'Short duration, early sowing' },
            { name: 'LRG-41', region: 'AP/Telangana', duration: '160 days', features: 'Bold grain, market preferred' },
        ],
        pests: [
            { name: 'Gram Pod Borer (Helicoverpa)', type: 'insect', symptoms: ['Bore holes in pods', 'Frass on pods', 'Seeds partially eaten'], affectedStage: ['Flowering', 'Pod filling'], severity: 'CRITICAL', treatment: [{ chemical: 'Emamectin benzoate 5% SG', dose: '0.4 g/litre', method: 'Foliar spray', phi: '14 days' }], bioControl: 'HaNPV 250 LE/acre + bird perches', prevention: ['Pheromone traps', 'Early sowing', 'Intercrop with sorghum'] },
        ],
        diseases: [
            { name: 'Fusarium Wilt', type: 'fungal', symptoms: ['Partial wilting', 'Internal browning of stem', 'Yellow leaves on one side'], favorableConditions: 'Soil-borne, previous crop infection', severity: 'CRITICAL', treatment: [{ chemical: 'Trichoderma viride seed treatment', dose: '4g/kg seed', method: 'Seed treatment' }], prevention: ['Resistant varieties (Asha)', 'Crop rotation (3-year cycle)', 'Seed treatment with Trichoderma'] },
            { name: 'Sterility Mosaic', type: 'viral', symptoms: ['Small pale green leaves', 'No flowering/podding', 'Bushy appearance'], favorableConditions: 'Eriophyid mite vector', severity: 'HIGH', treatment: [{ chemical: 'Wettable Sulphur 80% WP', dose: '3g/litre', method: 'Foliar spray for mite control' }], prevention: ['Resistant varieties', 'Mite management', 'Remove volunteer plants'] },
        ],
        economics: { seedCostPerAcre: 800, fertilizerCostPerAcre: 2500, labourCostPerAcre: 6000, expectedYieldKgPerAcre: 600, mspPerQuintal: 7000, profitPerAcre: 25000, durationDays: 160 },
        fertilizerSchedule: [
            { stage: 'Basal', product: 'DAP + MOP + Sulphur', dosePerAcre: '50kg DAP + 10kg MOP + 10kg S', method: 'Drill in furrows' },
            { stage: 'Flowering (100 DAS)', product: '2% DAP foliar', dosePerAcre: '20g/litre', method: 'Foliar spray for pod setting' },
        ],
        harvestIndicators: ['75% pods turn brown', 'Seeds rattle in pods', 'Morning harvest to reduce shattering'],
        storageNotes: 'Dry to <10% moisture. Treat with Neem oil for storage pests. Store in airtight containers.',
    },
];

/* ── Helper functions ── */

export function findCropByName(name: string): CropProfile | undefined {
    const q = name.toLowerCase().trim();
    return CROP_DATABASE.find(
        c =>
            c.name.toLowerCase() === q ||
            c.aliases.some(a => a.toLowerCase().includes(q)) ||
            q.includes(c.name.toLowerCase())
    );
}

export function findPestAcrossCrops(pestName: string): { crop: CropProfile; pest: PestProfile }[] {
    const q = pestName.toLowerCase().trim();
    const results: { crop: CropProfile; pest: PestProfile }[] = [];
    for (const crop of CROP_DATABASE) {
        for (const pest of crop.pests) {
            if (pest.name.toLowerCase().includes(q) || q.includes(pest.name.toLowerCase().split('(')[0].trim())) {
                results.push({ crop, pest });
            }
        }
    }
    return results;
}

export function findDiseaseAcrossCrops(diseaseName: string): { crop: CropProfile; disease: DiseaseProfile }[] {
    const q = diseaseName.toLowerCase().trim();
    const results: { crop: CropProfile; disease: DiseaseProfile }[] = [];
    for (const crop of CROP_DATABASE) {
        for (const disease of crop.diseases) {
            if (disease.name.toLowerCase().includes(q) || q.includes(disease.name.toLowerCase().split('(')[0].trim())) {
                results.push({ crop, disease });
            }
        }
    }
    return results;
}

export function getCropsBySeason(season: string): CropProfile[] {
    const s = season.toLowerCase();
    return CROP_DATABASE.filter(c => c.seasons?.some((se: string) => se.toLowerCase().includes(s)) ?? c.season.some(se => se.toLowerCase().includes(s)));
}

export function getCropsByRegion(region: string): CropProfile[] {
    const r = region.toLowerCase();
    return CROP_DATABASE.filter(c => c.regions.some(re => re.toLowerCase().includes(r)));
}
