/**
 * GreenX AI Agent — Rule-based agricultural intelligence engine
 * Analyzes: soil reports, pest alerts, operations, weather → generates
 * recommendations, auto-assigns tasks, crop suggestions, fertilizer plans.
 *
 * Trained on: India Crop Cultivation Manual (cereals, pulses, oilseeds,
 * vegetables, fruits — Kharif/Rabi/Zaid seasons).
 */

import {
    CROP_DATABASE,
    findPestAcrossCrops,
    findDiseaseAcrossCrops,
    getCropsBySeason,
    getCropsByRegion,
    type CropProfile,
    type PestProfile,
    type DiseaseProfile,
} from './cropKnowledgeBase';

// ── Types ───────────────────────────────────────────────────────────────────

export type AnalysisType =
    | 'soil_report'
    | 'pest_alert'
    | 'operation'
    | 'crop_plan'
    | 'weather'
    | 'general';

export interface AiRecommendation {
    id: string;
    type: AnalysisType;
    severity: 'info' | 'warning' | 'critical' | 'success';
    title: string;
    summary: string;
    details: string[];
    suggestedTasks: SuggestedTask[];
    relatedCrop?: string;
    confidence: number; // 0-100
    timestamp: string;
}

export interface SuggestedTask {
    title: string;
    description: string;
    priority: 'Normal' | 'HIGH' | 'Urgent';
    assignTo: 'FIELD_MANAGER' | 'WORKER' | 'EXPERT';
    dueInDays: number;
}

export interface SoilInput {
    ph?: number;
    nitrogen?: number;   // kg/ha
    phosphorus?: number;  // kg/ha
    potassium?: number;   // kg/ha
    organicCarbon?: number; // %
    zinc?: number;        // ppm
    iron?: number;        // ppm
    sulphur?: number;     // kg/ha
    boron?: number;       // ppm
    electricalConductivity?: number; // dS/m
    soilType?: string;
    region?: string;
    currentCrop?: string;
}

export interface PestInput {
    pestName: string;
    severity: string;
    affectedAreaPct?: number;
    cropName?: string;
    farmId?: string;
    description?: string;
    photos?: string;
}

export interface OperationInput {
    operationType: string;
    cropName?: string;
    farmId?: string;
    observations?: string;
    areaCoveredAcres?: number;
    productUsed?: string;
    quantityUsed?: string;
    photos?: string;
}

// ── Utilities ───────────────────────────────────────────────────────────────

function uid(): string {
    return crypto.randomUUID?.() ?? `ai-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function now(): string {
    return new Date().toISOString();
}

function matchCrop(name?: string): CropProfile | undefined {
    if (!name) return undefined;
    const q = name.toLowerCase().trim();
    return CROP_DATABASE.find(
        c =>
            c.name.toLowerCase() === q ||
            c.aliases.some(a => a.toLowerCase() === q) ||
            c.name.toLowerCase().includes(q) ||
            c.aliases.some(a => a.toLowerCase().includes(q)),
    );
}

function currentSeason(): string {
    const m = new Date().getMonth(); // 0-11
    if (m >= 5 && m <= 9) return 'Kharif';
    if (m >= 10 || m <= 2) return 'Rabi';
    return 'Zaid';
}

// ── Soil Analysis ───────────────────────────────────────────────────────────

export function analyzeSoilReport(input: SoilInput): AiRecommendation {
    const details: string[] = [];
    const tasks: SuggestedTask[] = [];
    let severity: AiRecommendation['severity'] = 'info';
    let confidence = 75;

    const crop = matchCrop(input.currentCrop);
    const season = currentSeason();
    const suitableCrops = input.region ? getCropsByRegion(input.region) : getCropsBySeason(season);

    // pH analysis
    if (input.ph != null) {
        if (input.ph < 5.5) {
            details.push(`⚠️ Soil pH ${input.ph} is too acidic. Apply agricultural lime (2-4 t/ha) to raise pH. Most crops prefer pH 6.0-7.5.`);
            tasks.push({ title: 'Apply lime to correct soil acidity', description: `Soil pH is ${input.ph}. Apply Dolomitic lime at 2-4 tonnes/ha and incorporate well. Retest after 3 months.`, priority: 'HIGH', assignTo: 'FIELD_MANAGER', dueInDays: 7 });
            severity = 'warning';
        } else if (input.ph > 8.5) {
            details.push(`⚠️ Soil pH ${input.ph} is highly alkaline. Apply gypsum (3-5 t/ha) to reduce pH. Consider sulphur application.`);
            tasks.push({ title: 'Apply gypsum for alkaline correction', description: `Soil pH is ${input.ph}. Apply gypsum at 3-5 tonnes/ha. Add organic matter (FYM 10 t/ha) to improve soil.`, priority: 'HIGH', assignTo: 'FIELD_MANAGER', dueInDays: 7 });
            severity = 'warning';
        } else if (input.ph >= 6.0 && input.ph <= 7.5) {
            details.push(`✅ Soil pH ${input.ph} is optimal for most crops.`);
        } else {
            details.push(`ℹ️ Soil pH ${input.ph} is acceptable but not ideal. Monitor and adjust if needed.`);
        }
        confidence += 5;
    }

    // Nitrogen
    if (input.nitrogen != null) {
        if (input.nitrogen < 200) {
            details.push(`⚠️ Nitrogen is LOW (${input.nitrogen} kg/ha). Recommended: 250-400 kg/ha for cereals. Apply Urea in split doses.`);
            const deficit = Math.round((280 - input.nitrogen) * 2.17); // convert to urea needed
            tasks.push({ title: 'Apply nitrogen fertilizer (Urea)', description: `Nitrogen deficient. Apply Urea at ${deficit} kg/ha in 3 split doses: basal (40%), tillering (30%), panicle (30%).`, priority: 'HIGH', assignTo: 'WORKER', dueInDays: 5 });
            severity = 'warning';
        } else if (input.nitrogen > 400) {
            details.push(`⚠️ Nitrogen is HIGH (${input.nitrogen} kg/ha). Excess N causes lodging, pest susceptibility. Reduce N application.`);
        } else {
            details.push(`✅ Nitrogen level (${input.nitrogen} kg/ha) is adequate.`);
        }
        confidence += 5;
    }

    // Phosphorus
    if (input.phosphorus != null) {
        if (input.phosphorus < 15) {
            details.push(`⚠️ Phosphorus is LOW (${input.phosphorus} kg/ha). Apply DAP (Di-ammonium Phosphate) or SSP as basal dose.`);
            tasks.push({ title: 'Apply phosphorus fertilizer', description: `Phosphorus deficient at ${input.phosphorus} kg/ha. Apply DAP 100-125 kg/ha or SSP 250-300 kg/ha as basal.`, priority: 'Normal', assignTo: 'WORKER', dueInDays: 7 });
        } else {
            details.push(`✅ Phosphorus level (${input.phosphorus} kg/ha) is adequate.`);
        }
        confidence += 3;
    }

    // Potassium
    if (input.potassium != null) {
        if (input.potassium < 120) {
            details.push(`⚠️ Potassium is LOW (${input.potassium} kg/ha). Apply MOP (Muriate of Potash) 60-80 kg/ha as basal.`);
            tasks.push({ title: 'Apply potassium fertilizer (MOP)', description: `Potassium low at ${input.potassium} kg/ha. Apply MOP at 60-80 kg/ha as basal dose before sowing.`, priority: 'Normal', assignTo: 'WORKER', dueInDays: 7 });
        } else {
            details.push(`✅ Potassium level (${input.potassium} kg/ha) is adequate.`);
        }
        confidence += 3;
    }

    // Organic Carbon
    if (input.organicCarbon != null) {
        if (input.organicCarbon < 0.5) {
            details.push(`⚠️ Organic Carbon is VERY LOW (${input.organicCarbon}%). Soil health is poor. Apply FYM 10-15 t/ha or vermicompost 3-5 t/ha.`);
            tasks.push({ title: 'Apply organic manure (FYM/Vermicompost)', description: `Organic carbon critically low at ${input.organicCarbon}%. Apply Farm Yard Manure 10-15 tonnes/ha or Vermicompost 3-5 t/ha. Consider green manuring with Dhaincha/Sunhemp.`, priority: 'HIGH', assignTo: 'FIELD_MANAGER', dueInDays: 14 });
            severity = 'critical';
        } else if (input.organicCarbon < 0.75) {
            details.push(`ℹ️ Organic Carbon is LOW (${input.organicCarbon}%). Supplement with organic manures (FYM 5-8 t/ha).`);
        } else {
            details.push(`✅ Organic Carbon (${input.organicCarbon}%) is good.`);
        }
        confidence += 5;
    }

    // Zinc
    if (input.zinc != null) {
        if (input.zinc < 0.6) {
            details.push(`⚠️ Zinc DEFICIENT (${input.zinc} ppm). Critical for rice/wheat. Apply ZnSO4 25 kg/ha.`);
            tasks.push({ title: 'Apply Zinc Sulphate', description: `Zinc deficient at ${input.zinc} ppm. Apply ZnSO4 (21%) at 25 kg/ha as basal. For standing crop: foliar spray ZnSO4 0.5% solution.`, priority: 'HIGH', assignTo: 'WORKER', dueInDays: 5 });
        } else {
            details.push(`✅ Zinc (${input.zinc} ppm) is sufficient.`);
        }
    }

    // Sulphur
    if (input.sulphur != null) {
        if (input.sulphur < 10) {
            details.push(`⚠️ Sulphur is LOW (${input.sulphur} kg/ha). Important for oilseeds/pulses. Apply Gypsum or Elemental Sulphur.`);
        } else {
            details.push(`✅ Sulphur (${input.sulphur} kg/ha) is adequate.`);
        }
    }

    // EC (salinity)
    if (input.electricalConductivity != null) {
        if (input.electricalConductivity > 4) {
            details.push(`🚨 Soil is SALINE (EC ${input.electricalConductivity} dS/m). Most crops will suffer. Use gypsum and leaching irrigation to reclaim.`);
            severity = 'critical';
        } else if (input.electricalConductivity > 2) {
            details.push(`⚠️ EC ${input.electricalConductivity} dS/m — slightly saline. Choose salt-tolerant crops (barley, cotton, sugarcane).`);
        }
    }

    // Crop-specific recommendations
    if (crop) {
        details.push(`\n📌 **Crop-specific recommendations for ${crop.name}:**`);
        if (input.ph != null) {
            if (input.ph < crop.soil.phMin || input.ph > crop.soil.phMax) {
                details.push(`⚠️ pH ${input.ph} is outside optimal range for ${crop.name} (${crop.soil.phMin}–${crop.soil.phMax}).`);
            } else {
                details.push(`✅ pH is within optimal range for ${crop.name}.`);
            }
        }
        details.push(`💊 Recommended NPK: N=${crop.nutrients.nitrogenKgHa}, P=${crop.nutrients.phosphorusKgHa}, K=${crop.nutrients.potassiumKgHa} kg/ha.`);
        if (crop.fertilizerSchedule.length > 0) {
            details.push(`📅 Fertilizer schedule:`);
            crop.fertilizerSchedule.forEach(fs => {
                details.push(`  • ${fs.stage}: ${fs.product} — ${fs.dosePerAcre} (${fs.method})`);
            });
        }
    }

    // Suitable crops based on soil
    if (!crop) {
        const suitable = suitableCrops.filter(c => {
            if (input.ph != null) return input.ph >= c.soil.phMin && input.ph <= c.soil.phMax;
            return true;
        }).slice(0, 5);
        if (suitable.length > 0) {
            details.push(`\n🌾 **Recommended crops for this soil/season (${season}):**`);
            suitable.forEach(c => {
                details.push(`  • ${c.name} — pH ${c.soil.phMin}–${c.soil.phMax}, Yield: ${c.economics.expectedYieldKgPerAcre} kg/acre, MSP: ₹${c.economics.mspPerQuintal}/q`);
            });
        }
    }

    return {
        id: uid(),
        type: 'soil_report',
        severity,
        title: crop ? `Soil Analysis for ${crop.name}` : 'Soil Health Analysis',
        summary: generateSoilSummary(input, severity),
        details,
        suggestedTasks: tasks,
        relatedCrop: crop?.name,
        confidence: Math.min(confidence, 95),
        timestamp: now(),
    };
}

function generateSoilSummary(input: SoilInput, severity: string): string {
    const issues: string[] = [];
    if (input.ph != null && (input.ph < 5.5 || input.ph > 8.5)) issues.push('pH imbalance');
    if (input.nitrogen != null && input.nitrogen < 200) issues.push('low nitrogen');
    if (input.phosphorus != null && input.phosphorus < 15) issues.push('low phosphorus');
    if (input.potassium != null && input.potassium < 120) issues.push('low potassium');
    if (input.organicCarbon != null && input.organicCarbon < 0.5) issues.push('very low organic carbon');
    if (input.zinc != null && input.zinc < 0.6) issues.push('zinc deficiency');
    if (issues.length === 0) return 'Soil is in good health. All parameters within acceptable range.';
    return `Found ${issues.length} issue(s): ${issues.join(', ')}. Immediate action recommended.`;
}

// ── Pest Analysis ───────────────────────────────────────────────────────────

export function analyzePestAlert(input: PestInput): AiRecommendation {
    const details: string[] = [];
    const tasks: SuggestedTask[] = [];
    let severity: AiRecommendation['severity'] = 'warning';
    let confidence = 60;

    const crop = matchCrop(input.cropName);
    const pestMatches = findPestAcrossCrops(input.pestName);
    const diseaseMatches = findDiseaseAcrossCrops(input.pestName);

    if (pestMatches.length > 0) {
        confidence = 85;
        const { crop: matchedCrop, pest } = pestMatches[0];
        details.push(`🐛 **Identified: ${pest.name}** on ${matchedCrop.name}`);
        details.push(`Type: ${pest.type} | Severity: ${pest.severity}`);
        details.push(`\n**Symptoms to verify:**`);
        pest.symptoms.forEach(s => details.push(`  • ${s}`));

        details.push(`\n**Recommended Treatment:**`);
        pest.treatment.forEach(t => {
            details.push(`  💊 ${t.chemical} — ${t.dose} (${t.method}). PHI: ${t.phi}`);
        });

        if (pest.bioControl) {
            details.push(`\n**Biological Control:** ${pest.bioControl}`);
        }

        details.push(`\n**Prevention measures:**`);
        pest.prevention.forEach(p => details.push(`  • ${p}`));

        // Generate tasks
        if (pest.severity === 'CRITICAL' || pest.severity === 'HIGH' || input.severity?.toUpperCase() === 'HIGH') {
            severity = 'critical';
            tasks.push({
                title: `URGENT: Apply ${pest.treatment[0]?.chemical || 'pesticide'} for ${pest.name}`,
                description: `${pest.name} detected with ${input.severity} severity affecting ${input.affectedAreaPct || '?'}% area. Apply ${pest.treatment[0]?.chemical} at ${pest.treatment[0]?.dose} by ${pest.treatment[0]?.method}. Observe PHI of ${pest.treatment[0]?.phi}.`,
                priority: 'Urgent',
                assignTo: 'WORKER',
                dueInDays: 1,
            });
            tasks.push({
                title: `Expert review: ${pest.name} infestation`,
                description: `Schedule field visit to assess ${pest.name} damage. Check affected area, neighboring fields. Consider if prescription needs adjustment.`,
                priority: 'HIGH',
                assignTo: 'EXPERT',
                dueInDays: 2,
            });
        } else {
            tasks.push({
                title: `Treat ${pest.name} on ${matchedCrop.name} field`,
                description: `Apply ${pest.treatment[0]?.chemical || 'recommended pesticide'} at ${pest.treatment[0]?.dose || 'recommended dose'}. ${pest.bioControl ? 'Also consider: ' + pest.bioControl : ''}`,
                priority: 'Normal',
                assignTo: 'WORKER',
                dueInDays: 3,
            });
        }

        tasks.push({
            title: `Monitor field for ${pest.name} re-infestation`,
            description: `Inspect field 5-7 days after treatment. Look for: ${pest.symptoms.slice(0, 2).join(', ')}. Report findings.`,
            priority: 'Normal',
            assignTo: 'FIELD_MANAGER',
            dueInDays: 7,
        });

    } else if (diseaseMatches.length > 0) {
        confidence = 85;
        const { crop: matchedCrop, disease } = diseaseMatches[0];
        details.push(`🦠 **Identified: ${disease.name}** on ${matchedCrop.name}`);
        details.push(`Type: ${disease.type} | Severity: ${disease.severity}`);
        details.push(`Favorable conditions: ${disease.favorableConditions}`);

        details.push(`\n**Symptoms:**`);
        disease.symptoms.forEach(s => details.push(`  • ${s}`));

        details.push(`\n**Treatment:**`);
        disease.treatment.forEach(t => {
            details.push(`  💊 ${t.chemical} — ${t.dose} (${t.method})`);
        });

        details.push(`\n**Prevention:**`);
        disease.prevention.forEach(p => details.push(`  • ${p}`));

        if (disease.severity === 'CRITICAL' || disease.severity === 'HIGH') {
            severity = 'critical';
        }

        tasks.push({
            title: `Treat ${disease.name} on ${matchedCrop.name}`,
            description: `Apply ${disease.treatment[0]?.chemical || 'fungicide'} at ${disease.treatment[0]?.dose || 'recommended dose'}. ${disease.prevention[0] || ''}`,
            priority: disease.severity === 'CRITICAL' ? 'Urgent' : 'HIGH',
            assignTo: 'WORKER',
            dueInDays: disease.severity === 'CRITICAL' ? 1 : 3,
        });
        tasks.push({
            title: `Expert prescription for ${disease.name}`,
            description: `Issue detailed prescription for ${disease.name} management. Review spray schedule and dosage.`,
            priority: 'HIGH',
            assignTo: 'EXPERT',
            dueInDays: 2,
        });

    } else {
        // Unknown pest — general advice
        details.push(`⚠️ Pest/disease "${input.pestName}" not found in knowledge base.`);
        details.push(`\n**General recommendations:**`);
        details.push(`  • Collect and photograph clear samples of affected parts`);
        details.push(`  • Note: affected area %, plant parts, growth stage`);
        details.push(`  • Send samples to nearest agriculture lab for identification`);
        details.push(`  • Avoid broad-spectrum pesticides until identified`);
        if (crop) {
            details.push(`\n**Known pests of ${crop.name}:**`);
            crop.pests.forEach(p => details.push(`  • ${p.name} (${p.severity})`));
            crop.diseases.forEach(d => details.push(`  • ${d.name} (${d.severity})`));
        }
        tasks.push({
            title: 'Expert field visit for pest identification',
            description: `Unidentified pest: "${input.pestName}". Expert must visit field, collect samples, and identify before treatment.`,
            priority: 'HIGH',
            assignTo: 'EXPERT',
            dueInDays: 2,
        });
    }

    return {
        id: uid(),
        type: 'pest_alert',
        severity,
        title: `Pest Analysis: ${input.pestName}`,
        summary: pestMatches.length > 0 || diseaseMatches.length > 0
            ? `Identified ${input.pestName}. ${tasks.length} actions recommended.`
            : `Unknown pest "${input.pestName}" — expert review needed.`,
        details,
        suggestedTasks: tasks,
        relatedCrop: crop?.name || pestMatches[0]?.crop.name || diseaseMatches[0]?.crop.name,
        confidence,
        timestamp: now(),
    };
}

// ── Operation Analysis ──────────────────────────────────────────────────────

export function analyzeOperation(input: OperationInput): AiRecommendation {
    const details: string[] = [];
    const tasks: SuggestedTask[] = [];
    let severity: AiRecommendation['severity'] = 'info';
    const crop = matchCrop(input.cropName);
    const opType = input.operationType?.toLowerCase() || '';

    details.push(`📋 Operation logged: **${input.operationType}**`);
    if (input.areaCoveredAcres) details.push(`Area: ${input.areaCoveredAcres} acres`);
    if (input.productUsed) details.push(`Product: ${input.productUsed} — ${input.quantityUsed || ''}`);
    if (input.observations) details.push(`Notes: ${input.observations}`);

    // Analyze based on type
    if (opType.includes('irrigation') || opType.includes('water')) {
        details.push(`\n💧 **Irrigation Analysis:**`);
        if (crop) {
            details.push(`${crop.name} requires ${crop.irrigation.waterMmPerSeason}mm/season.`);
            details.push(`Recommended method: ${crop.irrigation.method.join(', ')}`);
            details.push(`Critical stages: ${crop.irrigation.criticalStages.join(', ')}`);
            const nextStage = crop.growthStages.find(g => g.daysFromSowing > 30);
            if (nextStage) {
                tasks.push({
                    title: `Schedule next irrigation for ${nextStage.stage}`,
                    description: `${crop.name} critical stage: ${nextStage.stage}. Ensure irrigation ${crop.irrigation.frequencyDays} days from now.`,
                    priority: 'Normal',
                    assignTo: 'FIELD_MANAGER',
                    dueInDays: crop.irrigation.frequencyDays,
                });
            }
        }
    } else if (opType.includes('sowing') || opType.includes('planting') || opType.includes('transplant')) {
        details.push(`\n🌱 **Sowing Analysis:**`);
        if (crop) {
            details.push(`${crop.name} growth duration: ${crop.economics.durationDays} days.`);
            details.push(`Expected yield: ${crop.economics.expectedYieldKgPerAcre} kg/acre.`);
            details.push(`\nUpcoming activities:`);
            crop.growthStages.slice(1, 4).forEach(g => {
                details.push(`  • Day ${g.daysFromSowing}: ${g.stage} — ${g.keyActivity}`);
            });
            tasks.push({
                title: `Apply basal fertilizer for ${crop.name}`,
                description: `Before/at sowing: Apply DAP ${crop.nutrients.phosphorusKgHa}kg/ha + MOP ${crop.nutrients.potassiumKgHa}kg/ha as basal dose.`,
                priority: 'HIGH',
                assignTo: 'WORKER',
                dueInDays: 3,
            });
            tasks.push({
                title: `Schedule first weeding for ${crop.name}`,
                description: `First weeding due at 15-20 DAS. Manual or apply pre-emergence herbicide if not done.`,
                priority: 'Normal',
                assignTo: 'WORKER',
                dueInDays: 15,
            });
        }
        severity = 'success';
    } else if (opType.includes('fertili') || opType.includes('manur') || opType.includes('urea') || opType.includes('dap')) {
        details.push(`\n💊 **Fertilizer Application Analysis:**`);
        if (crop) {
            details.push(`Recommended NPK for ${crop.name}: N=${crop.nutrients.nitrogenKgHa}, P=${crop.nutrients.phosphorusKgHa}, K=${crop.nutrients.potassiumKgHa} kg/ha`);
            if (crop.nutrients.zincPpm) details.push(`Also ensure Zinc: ${crop.nutrients.zincPpm} ppm (ZnSO4 25 kg/ha if deficient)`);
        }
        tasks.push({
            title: 'Schedule next fertilizer application',
            description: crop
                ? `Follow ${crop.name} schedule: ${crop.fertilizerSchedule.map(f => f.stage).join(' → ')}`
                : 'Review crop-specific fertilizer schedule and apply next split dose on time.',
            priority: 'Normal',
            assignTo: 'FIELD_MANAGER',
            dueInDays: 15,
        });
    } else if (opType.includes('harvest')) {
        details.push(`\n🌾 **Harvest Analysis:**`);
        if (crop) {
            details.push(`Harvest indicators for ${crop.name}:`);
            crop.harvestIndicators.forEach(h => details.push(`  • ${h}`));
            details.push(`\nStorage: ${crop.storageNotes}`);
        }
        tasks.push({
            title: 'Post-harvest processing and storage',
            description: crop ? `${crop.name}: ${crop.storageNotes}` : 'Dry produce to safe moisture, clean and store properly.',
            priority: 'HIGH',
            assignTo: 'WORKER',
            dueInDays: 2,
        });
        severity = 'success';
    } else if (opType.includes('spray') || opType.includes('pesticide') || opType.includes('fungicide')) {
        details.push(`\n🧴 **Spray Operation:**`);
        details.push(`Product: ${input.productUsed || 'Not specified'}`);
        if (crop) {
            details.push(`Known pests for ${crop.name}:`);
            crop.pests.slice(0, 3).forEach(p => details.push(`  • ${p.name} — use ${p.treatment[0]?.chemical}, ${p.treatment[0]?.dose}`));
        }
        tasks.push({
            title: 'Observe Pre-Harvest Interval (PHI)',
            description: 'Ensure the required waiting period between last spray and harvest is maintained. Check label for specific PHI days.',
            priority: 'Normal',
            assignTo: 'FIELD_MANAGER',
            dueInDays: 14,
        });
    }

    // General follow-up
    if (crop && tasks.length === 0) {
        const nextStages = crop.growthStages.slice(0, 3);
        nextStages.forEach(g => {
            tasks.push({
                title: `${g.stage}: ${g.keyActivity.slice(0, 50)}`,
                description: g.keyActivity,
                priority: 'Normal',
                assignTo: 'FIELD_MANAGER',
                dueInDays: g.daysFromSowing,
            });
        });
    }

    return {
        id: uid(),
        type: 'operation',
        severity,
        title: `Operation: ${input.operationType}`,
        summary: `${input.operationType} logged. ${tasks.length} follow-up task(s) suggested.`,
        details,
        suggestedTasks: tasks,
        relatedCrop: crop?.name,
        confidence: crop ? 80 : 55,
        timestamp: now(),
    };
}

// ── Crop Recommendation ─────────────────────────────────────────────────────

export function recommendCrops(input: {
    region?: string;
    season?: string;
    soilType?: string;
    ph?: number;
    irrigationAvailable?: boolean;
    budget?: 'low' | 'medium' | 'high';
}): AiRecommendation {
    const details: string[] = [];
    const season = input.season || currentSeason();
    let crops = getCropsBySeason(season);

    if (input.region) {
        const regional = getCropsByRegion(input.region);
        if (regional.length > 0) {
            crops = crops.filter(c => regional.some(r => r.name === c.name));
            if (crops.length === 0) crops = regional; // fallback
        }
    }

    if (input.ph != null) {
        crops = crops.filter(c => input.ph! >= c.soil.phMin && input.ph! <= c.soil.phMax);
    }

    if (input.soilType) {
        const st = input.soilType.toLowerCase();
        const soilFiltered = crops.filter(c => c.soil.type.some(t => t.toLowerCase().includes(st)));
        if (soilFiltered.length > 0) crops = soilFiltered;
    }

    // Sort by profitability
    crops.sort((a, b) => b.economics.profitPerAcre - a.economics.profitPerAcre);
    const top = crops.slice(0, 6);

    details.push(`🌾 **Crop Recommendations for ${season} season${input.region ? ` in ${input.region}` : ''}:**\n`);

    top.forEach((c, i) => {
        details.push(`**${i + 1}. ${c.name}** ${c.aliases[0] ? `(${c.aliases[0]})` : ''}`);
        details.push(`  Soil: ${c.soil.type.join('/')} | pH: ${c.soil.phMin}–${c.soil.phMax}`);
        details.push(`  Duration: ${c.economics.durationDays} days | Yield: ${c.economics.expectedYieldKgPerAcre} kg/acre`);
        details.push(`  MSP: ₹${c.economics.mspPerQuintal}/quintal | Profit: ₹${c.economics.profitPerAcre}/acre`);
        details.push(`  Water: ${c.irrigation.waterMmPerSeason}mm/season (${c.irrigation.method[0]})`);
        if (c.varieties.length > 0) {
            details.push(`  Varieties: ${c.varieties.slice(0, 2).map(v => v.name).join(', ')}`);
        }
        details.push('');
    });

    return {
        id: uid(),
        type: 'crop_plan',
        severity: 'success',
        title: `${season} Crop Recommendations`,
        summary: `${top.length} crops recommended for ${season}${input.region ? ` in ${input.region}` : ''}, sorted by profitability.`,
        details,
        suggestedTasks: top.slice(0, 2).map(c => ({
            title: `Prepare for ${c.name} sowing`,
            description: `${c.name}: Soil prep → ${c.soil.type[0]} soil, apply basal fertilizer (N=${c.nutrients.nitrogenKgHa}, P=${c.nutrients.phosphorusKgHa}, K=${c.nutrients.potassiumKgHa} kg/ha). Duration: ${c.economics.durationDays} days.`,
            priority: 'Normal' as const,
            assignTo: 'FIELD_MANAGER' as const,
            dueInDays: 14,
        })),
        confidence: 75,
        timestamp: now(),
    };
}

// ── General Query (chat-style) ──────────────────────────────────────────────

export function askAI(question: string): AiRecommendation {
    const q = question.toLowerCase();
    const details: string[] = [];
    const tasks: SuggestedTask[] = [];

    // Try to detect crop in question
    const crop = CROP_DATABASE.find(
        c => q.includes(c.name.toLowerCase()) || c.aliases.some(a => q.includes(a.toLowerCase())),
    );

    if (crop) {
        // Answer with crop info
        details.push(`📖 **${crop.name} — Complete Guide:**\n`);
        details.push(`🌍 Regions: ${crop.regions.join(', ')}`);
        details.push(`📅 Season: ${crop.season.join(', ')}`);
        details.push(`🌱 Soil: ${crop.soil.type.join('/')} | pH ${crop.soil.phMin}–${crop.soil.phMax}`);
        details.push(`💧 Water: ${crop.irrigation.waterMmPerSeason}mm/season | Method: ${crop.irrigation.method.join(', ')}`);
        details.push(`💊 NPK: N=${crop.nutrients.nitrogenKgHa}, P=${crop.nutrients.phosphorusKgHa}, K=${crop.nutrients.potassiumKgHa} kg/ha`);
        details.push(`💰 Yield: ${crop.economics.expectedYieldKgPerAcre} kg/acre | MSP: ₹${crop.economics.mspPerQuintal}/q`);
        details.push(`📊 Profit: ₹${crop.economics.profitPerAcre}/acre | Duration: ${crop.economics.durationDays} days`);

        if (q.includes('pest') || q.includes('disease') || q.includes('insect') || q.includes('bug')) {
            details.push(`\n🐛 **Pests & Diseases:**`);
            crop.pests.forEach(p => details.push(`  • ${p.name} (${p.type}, ${p.severity}) — Treat: ${p.treatment[0]?.chemical || 'see manual'}`));
            crop.diseases.forEach(d => details.push(`  • ${d.name} (${d.type}, ${d.severity}) — Treat: ${d.treatment[0]?.chemical || 'see manual'}`));
        }
        if (q.includes('variety') || q.includes('varieties') || q.includes('hybrid')) {
            details.push(`\n🌾 **Varieties:**`);
            crop.varieties.forEach(v => details.push(`  • ${v.name} — ${v.region} (${v.duration}) — ${v.features}`));
        }
        if (q.includes('fertiliz') || q.includes('nutri') || q.includes('manure') || q.includes('schedule')) {
            details.push(`\n📅 **Fertilizer Schedule:**`);
            crop.fertilizerSchedule.forEach(f => details.push(`  • ${f.stage}: ${f.product} — ${f.dosePerAcre} (${f.method})`));
        }
        if (q.includes('stage') || q.includes('growth') || q.includes('calendar')) {
            details.push(`\n📆 **Growth Stages:**`);
            crop.growthStages.forEach(g => details.push(`  • Day ${g.daysFromSowing}: ${g.stage} — ${g.keyActivity}`));
        }
        if (q.includes('harvest') || q.includes('post')) {
            details.push(`\n🌾 **Harvest:**`);
            crop.harvestIndicators.forEach(h => details.push(`  • ${h}`));
            details.push(`Storage: ${crop.storageNotes}`);
        }
    } else if (q.includes('season') || q.includes('kharif') || q.includes('rabi') || q.includes('zaid')) {
        const season = q.includes('kharif') ? 'Kharif' : q.includes('rabi') ? 'Rabi' : q.includes('zaid') ? 'Zaid' : currentSeason();
        const crops = getCropsBySeason(season);
        details.push(`📅 **${season} Season Crops:**\n`);
        crops.forEach(c => details.push(`  • ${c.name} — ${c.economics.durationDays} days, Yield: ${c.economics.expectedYieldKgPerAcre} kg/acre`));
    } else if (q.includes('soil') || q.includes('ph') || q.includes('fertili')) {
        details.push(`🧪 **Soil & Fertilizer Guide:**\n`);
        details.push(`For soil analysis, submit a soil report and the AI will analyze NPK, pH, micronutrients.`);
        details.push(`\nGeneral NPK recommendations by crop type:`);
        CROP_DATABASE.slice(0, 6).forEach(c => {
            details.push(`  • ${c.name}: N=${c.nutrients.nitrogenKgHa}, P=${c.nutrients.phosphorusKgHa}, K=${c.nutrients.potassiumKgHa} kg/ha`);
        });
    } else {
        details.push(`🤖 I can help with:`);
        details.push(`  • **Crop info**: Ask about any crop (rice, wheat, cotton, etc.)`);
        details.push(`  • **Pest/disease ID**: Describe symptoms or name the pest`);
        details.push(`  • **Soil analysis**: Provide NPK, pH values for recommendations`);
        details.push(`  • **Season planning**: Ask about Kharif/Rabi/Zaid crops`);
        details.push(`  • **Fertilizer schedules**: Ask about specific crop nutrient plans`);
        details.push(`\n📚 Knowledge base: ${CROP_DATABASE.length} crops, ${CROP_DATABASE.reduce((s, c) => s + c.pests.length + c.diseases.length, 0)} pests/diseases cataloged.`);
    }

    return {
        id: uid(),
        type: 'general',
        severity: crop ? 'success' : 'info',
        title: crop ? `${crop.name} Information` : 'AI Assistant',
        summary: crop ? `Complete guide for ${crop.name} cultivation.` : 'Agricultural AI knowledge base ready.',
        details,
        suggestedTasks: tasks,
        relatedCrop: crop?.name,
        confidence: crop ? 90 : 50,
        timestamp: now(),
    };
}

// ── Master Analyze Function ─────────────────────────────────────────────────

export function aiAnalyze(
    type: AnalysisType,
    data: SoilInput | PestInput | OperationInput | { question: string } | { region?: string; season?: string; soilType?: string; ph?: number },
): AiRecommendation {
    switch (type) {
        case 'soil_report':
            return analyzeSoilReport(data as SoilInput);
        case 'pest_alert':
            return analyzePestAlert(data as PestInput);
        case 'operation':
            return analyzeOperation(data as OperationInput);
        case 'crop_plan':
            return recommendCrops(data as any);
        default:
            return askAI((data as any).question || '');
    }
}
