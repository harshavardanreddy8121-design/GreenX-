package com.greenx.farmapi.service;

import com.greenx.farmapi.ai.knowledge.*;
import com.greenx.farmapi.entity.AiConversation;
import com.greenx.farmapi.entity.AiInsight;
import com.greenx.farmapi.repository.AiConversationRepository;
import com.greenx.farmapi.repository.AiInsightRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Generative AI Service — integrates OpenAI GPT-4 with the farm knowledge base.
 *
 * When OPENAI_API_KEY is configured, requests are forwarded to GPT-4 with a
 * rich agricultural system prompt built from the local knowledge bases.
 * When no key is present the service falls back to the deterministic
 * rule-based engine so the application always returns useful responses.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AiService {

    private final AiConversationRepository conversationRepository;
    private final AiInsightRepository insightRepository;
    private final AIAgentService agentService;
    private final CropHealthAnalyzer healthAnalyzer;
    private final AlertService alertService;

    // Reads openai.api-key from application.yml, which itself resolves OPENAI_API_KEY.
    // The second fallback ${OPENAI_API_KEY:} ensures the raw env var is also tried
    // in case the YAML property chain is not resolved (e.g. during early context init).
    @Value("${openai.api-key:${OPENAI_API_KEY:}}")
    private String openAiApiKey;

    @Value("${openai.model:${AI_MODEL:gpt-4o}}")
    private String openAiModel;

    /** Ordered fallback chain tried when the primary model is unavailable. */
    private static final List<String> MODEL_FALLBACK_CHAIN = List.of("gpt-4o", "gpt-3.5-turbo");

    @Value("${openai.temperature:${AI_TEMPERATURE:0.7}}")
    private double temperature;

    @Value("${openai.max-tokens:${AI_MAX_TOKENS:2000}}")
    private int maxTokens;

    private static final String OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

    // ── Lifecycle ─────────────────────────────────────────────────────────────

    @PostConstruct
    public void logConfigurationStatus() {
        String trimmedKey = openAiApiKey != null ? openAiApiKey.trim() : "";
        if (trimmedKey.isEmpty()) {
            log.warn("[GreenX AI] OPENAI_API_KEY is not set — falling back to rule-based engine. " +
                     "Set OPENAI_API_KEY in Railway environment variables to enable GPT.");
        } else if (trimmedKey.equals("your-openai-api-key")) {
            log.warn("[GreenX AI] OPENAI_API_KEY is still the placeholder value — " +
                     "replace it with a real key to enable GPT.");
        } else {
            String masked = trimmedKey.substring(0, Math.min(7, trimmedKey.length())) + "****";
            log.info("[GreenX AI] OpenAI configured ✓  key={} primaryModel={} fallbackChain={} maxTokens={}",
                     masked, openAiModel, MODEL_FALLBACK_CHAIN, maxTokens);
        }
    }

    // ── Public API ────────────────────────────────────────────────────────────

    /**
     * Analyze farm data and generate a comprehensive AI report.
     * Combines rule-based analysis with optional GPT-4 narrative.
     */
    public Map<String, Object> analyzeFarm(Map<String, Object> farmData) {
        // Run deterministic analysis first
        Map<String, Object> baseAnalysis = agentService.analyzeFarm(farmData);

        // Enrich with generative narrative if OpenAI is configured
        if (isOpenAiConfigured()) {
            try {
                String narrative = generateFarmNarrative(farmData, baseAnalysis);
                baseAnalysis.put("aiNarrative", narrative);
                baseAnalysis.put("modelUsed", openAiModel);
            } catch (Exception e) {
                log.warn("OpenAI call failed, using rule-based analysis: {}", e.getMessage());
                baseAnalysis.put("aiNarrative", buildRuleBasedNarrative(farmData, baseAnalysis));
                baseAnalysis.put("modelUsed", "rule-based");
            }
        } else {
            log.debug("[GreenX AI] OpenAI not configured — using rule-based engine for farm analysis");
            baseAnalysis.put("aiNarrative", buildRuleBasedNarrative(farmData, baseAnalysis));
            baseAnalysis.put("modelUsed", "rule-based");
        }

        // Persist as an insight
        persistInsight(
                (String) farmData.get("farmId"),
                (String) farmData.get("userId"),
                "CROP_HEALTH",
                determineSeverity(baseAnalysis),
                "Farm Analysis Complete",
                buildInsightSummary(baseAnalysis),
                (String) baseAnalysis.get("aiNarrative")
        );

        return baseAnalysis;
    }

    /**
     * Generate crop recommendations based on soil, climate, and season data.
     */
    public Map<String, Object> getCropRecommendations(Map<String, Object> input) {
        Map<String, Object> result = new HashMap<>();

        try {
            String soilTypeStr = (String) input.getOrDefault("soilType", "LOAMY");
            SoilAnalysisKnowledge.SoilType soilType = parseSoilType(soilTypeStr);
            double ph = toDouble(input.getOrDefault("ph", 7.0));
            String seasonStr = (String) input.getOrDefault("season", currentSeason());
            CropKnowledge.Season season = parseSeason(seasonStr);
            double rainfall = toDouble(input.getOrDefault("rainfall", 800));
            double temperature = toDouble(input.getOrDefault("temperature", 25));

            List<String> crops = CropKnowledge.recommendCrops(soilType, ph, season, rainfall, temperature);
            Map<String, Object> soilInfo = SoilAnalysisKnowledge.getSoilTypeInfo(soilType);

            result.put("recommendedCrops", crops);
            result.put("soilInfo", soilInfo);
            result.put("season", season.name());
            result.put("conditions", Map.of(
                    "soilType", soilTypeStr,
                    "ph", ph,
                    "rainfall", rainfall,
                    "temperature", temperature
            ));

            // Enrich with GPT-4 if available
            if (isOpenAiConfigured()) {
                try {
                    String prompt = buildCropRecommendationPrompt(input, crops);
                    String aiAdvice = callOpenAI(buildSystemPrompt(), prompt);
                    result.put("aiAdvice", aiAdvice);
                    result.put("modelUsed", openAiModel);
                } catch (Exception e) {
                    log.warn("OpenAI crop recommendation failed: {}", e.getMessage());
                    result.put("aiAdvice", buildRuleBasedCropAdvice(crops, soilInfo));
                    result.put("modelUsed", "rule-based");
                }
            } else {
                result.put("aiAdvice", buildRuleBasedCropAdvice(crops, soilInfo));
                result.put("modelUsed", "rule-based");
            }

        } catch (Exception e) {
            log.error("Crop recommendation error: {}", e.getMessage());
            result.put("error", "Unable to generate recommendations: " + e.getMessage());
            result.put("recommendedCrops", List.of("Consult local agricultural officer for crop selection"));
        }

        return result;
    }

    /**
     * Predict pest and disease risks based on crop, weather, and soil data.
     */
    public Map<String, Object> predictPestRisk(Map<String, Object> input) {
        Map<String, Object> result = new HashMap<>();

        String cropName = (String) input.getOrDefault("cropName", "rice");
        double temperature = toDouble(input.getOrDefault("temperature", 25));
        double humidity = toDouble(input.getOrDefault("humidity", 70));
        double rainfall = toDouble(input.getOrDefault("rainfall", 50));

        // Get known pests for this crop
        List<String> cropPests = PestDiseaseKnowledge.getCropPests(cropName.toLowerCase());

        // Assess disease risk from weather
        List<String> diseaseRisk = GrowthMonitoringKnowledge.assessDiseaseRisk(temperature, humidity, rainfall);

        // Calculate risk score
        int riskScore = calculatePestRiskScore(temperature, humidity, rainfall, cropPests.size());
        String riskLevel = riskScore >= 70 ? "HIGH" : riskScore >= 40 ? "MEDIUM" : "LOW";

        result.put("cropName", cropName);
        result.put("riskScore", riskScore);
        result.put("riskLevel", riskLevel);
        result.put("knownPests", cropPests);
        result.put("diseaseRiskAssessment", diseaseRisk);
        result.put("weatherConditions", Map.of(
                "temperature", temperature,
                "humidity", humidity,
                "rainfall", rainfall
        ));

        // Preventive recommendations
        List<String> preventions = buildPestPreventionPlan(cropName, riskLevel, temperature, humidity);
        result.put("preventiveActions", preventions);

        // GPT-4 enrichment
        if (isOpenAiConfigured()) {
            try {
                String prompt = buildPestPredictionPrompt(input, cropPests, riskLevel);
                String aiAnalysis = callOpenAI(buildSystemPrompt(), prompt);
                result.put("aiAnalysis", aiAnalysis);
                result.put("modelUsed", openAiModel);
            } catch (Exception e) {
                log.warn("OpenAI pest prediction failed: {}", e.getMessage());
                result.put("aiAnalysis", String.join("\n", diseaseRisk));
                result.put("modelUsed", "rule-based");
            }
        } else {
            result.put("aiAnalysis", String.join("\n", diseaseRisk));
            result.put("modelUsed", "rule-based");
        }

        return result;
    }

    /**
     * Optimize resource usage (water, fertilizer, labor) for a farm.
     */
    public Map<String, Object> optimizeResources(Map<String, Object> input) {
        Map<String, Object> result = new HashMap<>();

        String cropName = (String) input.getOrDefault("cropName", "rice");
        double soilMoisture = toDouble(input.getOrDefault("soilMoisture", 30));
        double rainfall = toDouble(input.getOrDefault("rainfall", 0));
        double temperature = toDouble(input.getOrDefault("temperature", 25));
        double nitrogen = toDouble(input.getOrDefault("nitrogen", 150));
        double phosphorus = toDouble(input.getOrDefault("phosphorus", 20));
        double potassium = toDouble(input.getOrDefault("potassium", 200));
        double areaAcres = toDouble(input.getOrDefault("areaAcres", 1));

        // Water optimization
        List<String> waterAdvice = GrowthMonitoringKnowledge.analyzeWaterStress(soilMoisture, rainfall, temperature);

        // Nutrient optimization
        List<String> nutrientAdvice = new ArrayList<>();
        nutrientAdvice.addAll(SoilAnalysisKnowledge.analyzeNitrogen(nitrogen));
        nutrientAdvice.addAll(SoilAnalysisKnowledge.analyzePhosphorus(phosphorus));
        nutrientAdvice.addAll(SoilAnalysisKnowledge.analyzePotassium(potassium));

        // Crop-specific nutrient needs
        Map<String, Double> cropNeeds = CropKnowledge.getCropNutrientNeeds(cropName.toLowerCase());

        // Calculate fertilizer quantities needed
        Map<String, Object> fertilizerPlan = buildFertilizerPlan(cropNeeds, nitrogen, phosphorus, potassium, areaAcres);

        // Labor optimization
        Map<String, Object> laborPlan = buildLaborPlan(cropName, areaAcres);

        result.put("waterOptimization", waterAdvice);
        result.put("nutrientOptimization", nutrientAdvice);
        result.put("fertilizerPlan", fertilizerPlan);
        result.put("laborPlan", laborPlan);
        result.put("cropNutrientNeeds", cropNeeds);
        result.put("estimatedSavings", calculateEstimatedSavings(nitrogen, phosphorus, potassium, cropNeeds, areaAcres));

        // GPT-4 enrichment
        if (isOpenAiConfigured()) {
            try {
                String prompt = buildResourceOptimizationPrompt(input, waterAdvice, nutrientAdvice);
                String aiPlan = callOpenAI(buildSystemPrompt(), prompt);
                result.put("aiOptimizationPlan", aiPlan);
                result.put("modelUsed", openAiModel);
            } catch (Exception e) {
                log.warn("OpenAI resource optimization failed: {}", e.getMessage());
                result.put("aiOptimizationPlan", buildRuleBasedOptimizationSummary(waterAdvice, nutrientAdvice));
                result.put("modelUsed", "rule-based");
            }
        } else {
            result.put("aiOptimizationPlan", buildRuleBasedOptimizationSummary(waterAdvice, nutrientAdvice));
            result.put("modelUsed", "rule-based");
        }

        return result;
    }

    /**
     * Multi-turn conversational AI — ask any agricultural question.
     * Maintains conversation history for context-aware responses.
     */
    public Map<String, Object> ask(String question, String sessionId, String userId, String farmId) {
        Map<String, Object> result = new HashMap<>();

        // Load conversation history for context
        List<AiConversation> history = sessionId != null
                ? conversationRepository.findConversationHistory(sessionId)
                : new ArrayList<>();

        // Save user message
        String activeSessionId = sessionId != null ? sessionId : UUID.randomUUID().toString();
        AiConversation userMsg = AiConversation.builder()
                .userId(userId)
                .farmId(farmId)
                .sessionId(activeSessionId)
                .role("USER")
                .content(question)
                .type("CHAT")
                .build();
        conversationRepository.save(userMsg);

        String answer;
        String modelUsed;

        if (isOpenAiConfigured()) {
            try {
                answer = callOpenAIWithHistory(buildSystemPrompt(), question, history);
                modelUsed = openAiModel;
            } catch (Exception e) {
                log.warn("OpenAI ask failed, using rule-based: {}", e.getMessage());
                answer = generateRuleBasedAnswer(question);
                modelUsed = "rule-based";
            }
        } else {
            answer = generateRuleBasedAnswer(question);
            modelUsed = "rule-based";
        }

        // Save assistant response
        AiConversation assistantMsg = AiConversation.builder()
                .userId(userId)
                .farmId(farmId)
                .sessionId(activeSessionId)
                .role("ASSISTANT")
                .content(answer)
                .type("CHAT")
                .modelUsed(modelUsed)
                .confidenceScore(isOpenAiConfigured() ? 90 : 75)
                .build();
        conversationRepository.save(assistantMsg);

        result.put("answer", answer);
        result.put("sessionId", activeSessionId);
        result.put("modelUsed", modelUsed);
        result.put("timestamp", LocalDateTime.now().toString());
        result.put("conversationLength", history.size() + 2);

        return result;
    }

    /**
     * Get all active AI insights for a farm or user.
     */
    public List<Map<String, Object>> getInsights(String farmId, String userId) {
        List<AiInsight> insights;
        if (farmId != null && !farmId.isBlank()) {
            insights = insightRepository.findByFarmIdAndIsDismissedFalseOrderByCreatedAtDesc(farmId);
        } else if (userId != null && !userId.isBlank()) {
            insights = insightRepository.findByUserIdAndIsDismissedFalseOrderByCreatedAtDesc(userId);
        } else {
            insights = insightRepository.findAllActiveInsights();
        }

        return insights.stream().map(this::insightToMap).collect(Collectors.toList());
    }

    /**
     * Generate a comprehensive farm report using AI.
     */
    public Map<String, Object> generateReport(Map<String, Object> farmData) {
        Map<String, Object> report = new HashMap<>();

        // Run full analysis
        Map<String, Object> analysis = agentService.analyzeFarm(farmData);
        Map<String, Object> health = healthAnalyzer.analyzeHealth(farmData);
        List<Map<String, Object>> alerts = alertService.generateAlerts(farmData, health);

        report.put("farmId", farmData.get("farmId"));
        report.put("generatedAt", LocalDateTime.now().toString());
        report.put("reportType", "COMPREHENSIVE_FARM_ANALYSIS");

        // Executive summary
        Map<String, Object> summary = new HashMap<>();
        summary.put("overallHealthScore", health.get("overallScore"));
        summary.put("healthStatus", health.get("status"));
        summary.put("totalAlerts", alerts.size());
        summary.put("criticalAlerts", alerts.stream().filter(a -> "high".equals(a.get("severity"))).count());
        summary.put("riskLevel", calculateRiskLevel(health));
        report.put("executiveSummary", summary);

        // Detailed sections
        report.put("soilAnalysis", buildSoilAnalysisSection(farmData));
        report.put("cropHealth", health);
        report.put("alerts", alerts);
        report.put("recommendations", analysis.get("recommendations"));
        report.put("pestDiseaseRisk", health.get("pestDiseaseAlerts"));
        report.put("weatherAnalysis", health.get("weatherAlerts"));
        report.put("harvestGuidance", health.get("harvestGuidance"));

        // AI narrative report
        if (isOpenAiConfigured()) {
            try {
                String prompt = buildReportPrompt(farmData, analysis, health, alerts);
                String narrative = callOpenAI(buildSystemPrompt(), prompt);
                report.put("aiNarrative", narrative);
                report.put("modelUsed", openAiModel);
            } catch (Exception e) {
                log.warn("OpenAI report generation failed: {}", e.getMessage());
                report.put("aiNarrative", buildRuleBasedReport(farmData, analysis, health, alerts));
                report.put("modelUsed", "rule-based");
            }
        } else {
            report.put("aiNarrative", buildRuleBasedReport(farmData, analysis, health, alerts));
            report.put("modelUsed", "rule-based");
        }

        // Persist as insight
        persistInsight(
                (String) farmData.get("farmId"),
                (String) farmData.get("userId"),
                "GENERAL",
                determineSeverity(analysis),
                "Comprehensive Farm Report Generated",
                "Full AI analysis report with " + alerts.size() + " alerts and recommendations.",
                (String) report.get("aiNarrative")
        );

        return report;
    }

    /**
     * Get conversation history for a session.
     */
    public List<Map<String, Object>> getConversationHistory(String sessionId) {
        return conversationRepository.findConversationHistory(sessionId)
                .stream()
                .map(c -> {
                    Map<String, Object> msg = new HashMap<>();
                    msg.put("id", c.getId());
                    msg.put("role", c.getRole());
                    msg.put("content", c.getContent());
                    msg.put("timestamp", c.getCreatedAt() != null ? c.getCreatedAt().toString() : "");
                    msg.put("modelUsed", c.getModelUsed());
                    return msg;
                })
                .collect(Collectors.toList());
    }

    // ── OpenAI Integration ────────────────────────────────────────────────────

    private boolean isOpenAiConfigured() {
        if (openAiApiKey == null) return false;
        String key = openAiApiKey.trim();
        return !key.isEmpty() && !key.equals("your-openai-api-key");
    }

    /** Returns a masked version of the API key for safe logging/display. */
    public String getMaskedApiKey() {
        if (openAiApiKey == null) return "not-set";
        String key = openAiApiKey.trim();
        if (key.isEmpty()) return "not-set";
        if (key.equals("your-openai-api-key")) return "placeholder";
        return key.substring(0, Math.min(7, key.length())) + "****";
    }

    /** Returns whether OpenAI is currently active. */
    public boolean isOpenAiActive() {
        return isOpenAiConfigured();
    }

    @SuppressWarnings("unchecked")
    private String callOpenAI(String systemPrompt, String userMessage) {
        List<Map<String, String>> messages = new ArrayList<>();
        messages.add(Map.of("role", "system", "content", systemPrompt));
        messages.add(Map.of("role", "user", "content", userMessage));
        return callOpenAIWithModels(messages);
    }

    @SuppressWarnings("unchecked")
    private String callOpenAIWithHistory(String systemPrompt, String userMessage, List<AiConversation> history) {
        List<Map<String, String>> messages = new ArrayList<>();
        messages.add(Map.of("role", "system", "content", systemPrompt));

        // Add conversation history (last 10 messages for context window management)
        int startIdx = Math.max(0, history.size() - 10);
        for (int i = startIdx; i < history.size(); i++) {
            AiConversation msg = history.get(i);
            messages.add(Map.of(
                    "role", msg.getRole().toLowerCase(),
                    "content", msg.getContent() != null ? msg.getContent() : ""
            ));
        }

        messages.add(Map.of("role", "user", "content", userMessage));
        return callOpenAIWithModels(messages);
    }

    /**
     * Attempt the OpenAI chat-completions call with the configured primary model,
     * then fall back through MODEL_FALLBACK_CHAIN on model-not-found errors.
     * Throws the last exception if every model in the chain fails.
     */
    @SuppressWarnings("unchecked")
    private String callOpenAIWithModels(List<Map<String, String>> messages) {
        RestTemplate restTemplate = new RestTemplate();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(openAiApiKey);

        // Build the ordered list of models to try: primary first, then fallbacks
        List<String> modelsToTry = new ArrayList<>();
        modelsToTry.add(openAiModel);
        for (String fallback : MODEL_FALLBACK_CHAIN) {
            if (!fallback.equals(openAiModel)) {
                modelsToTry.add(fallback);
            }
        }

        Exception lastException = null;
        for (String model : modelsToTry) {
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", model);
            requestBody.put("messages", messages);
            requestBody.put("temperature", temperature);
            requestBody.put("max_tokens", maxTokens);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            try {
                log.debug("[GreenX AI] Calling OpenAI with model={}", model);
                ResponseEntity<Map> response = restTemplate.postForEntity(OPENAI_API_URL, entity, Map.class);
                if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                    List<Map<String, Object>> choices = (List<Map<String, Object>>) response.getBody().get("choices");
                    if (choices != null && !choices.isEmpty()) {
                        Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
                        if (!model.equals(openAiModel)) {
                            log.info("[GreenX AI] Primary model '{}' unavailable; used fallback model '{}'",
                                     openAiModel, model);
                        }
                        return (String) message.get("content");
                    }
                }
                lastException = new RuntimeException("No response from OpenAI with model=" + model);
            } catch (Exception e) {
                String msg = e.getMessage() != null ? e.getMessage() : "";
                boolean isModelNotFound = msg.contains("model_not_found")
                        || msg.contains("does not exist")
                        || msg.contains("404");
                if (isModelNotFound) {
                    log.warn("[GreenX AI] Model '{}' not available ({}), trying next fallback...", model, msg);
                    lastException = e;
                } else {
                    // Non-model error (auth, network, quota) — fail fast, no point retrying other models
                    log.error("[GreenX AI] OpenAI API call failed with model='{}': {}", model, msg);
                    throw e;
                }
            }
        }

        log.error("[GreenX AI] All models exhausted: {}. Last error: {}", modelsToTry,
                  lastException != null ? lastException.getMessage() : "unknown");
        throw new RuntimeException("All OpenAI models unavailable: " + modelsToTry, lastException);
    }



    // ── System Prompt ─────────────────────────────────────────────────────────

    private String buildSystemPrompt() {
        return """
                You are GreenX AI — an expert agricultural intelligence assistant for Indian farmers.
                You have deep knowledge of:
                - Indian crop cultivation (Kharif, Rabi, Zaid seasons)
                - Soil science and NPK management
                - Pest and disease identification and treatment
                - Irrigation and water management
                - Fertilizer schedules and organic farming
                - Market prices and financial planning
                - Weather impact on crops
                - Government schemes (PM-KISAN, MSP, crop insurance)
                
                You analyze farm data and provide:
                1. Specific, actionable recommendations
                2. Risk assessments with severity levels
                3. Step-by-step treatment plans
                4. Cost-effective solutions
                5. Preventive measures
                
                Always respond in clear, practical language. Use bullet points for lists.
                Include specific product names, doses, and timelines when relevant.
                Prioritize farmer safety and sustainable practices.
                When uncertain, recommend consulting a local agricultural officer.
                """;
    }

    // ── Prompt Builders ───────────────────────────────────────────────────────

    private String generateFarmNarrative(Map<String, Object> farmData, Map<String, Object> analysis) {
        String prompt = String.format("""
                Analyze this farm data and provide a comprehensive assessment:
                
                Farm Data: %s
                
                Analysis Results:
                - Overall Health Score: %s/100
                - Risk Level: %s
                - Number of Alerts: %s
                
                Provide:
                1. Executive summary (2-3 sentences)
                2. Top 3 immediate actions needed
                3. 30-day outlook
                4. Key risks to monitor
                """,
                farmData.toString(),
                analysis.getOrDefault("summary", Map.of()).toString(),
                analysis.getOrDefault("summary", Map.of()).toString(),
                ((List<?>) analysis.getOrDefault("alerts", List.of())).size()
        );
        return callOpenAI(buildSystemPrompt(), prompt);
    }

    private String buildCropRecommendationPrompt(Map<String, Object> input, List<String> crops) {
        return String.format("""
                Based on these farm conditions, provide detailed crop recommendations:
                
                Conditions: %s
                Rule-based recommendations: %s
                
                For the top 3 recommended crops, provide:
                1. Why this crop suits these conditions
                2. Expected yield and profit potential
                3. Key management practices
                4. Risks and mitigation strategies
                """,
                input.toString(),
                String.join(", ", crops.subList(0, Math.min(3, crops.size())))
        );
    }

    private String buildPestPredictionPrompt(Map<String, Object> input, List<String> pests, String riskLevel) {
        return String.format("""
                Predict pest and disease risks for this farm:
                
                Conditions: %s
                Known pests for this crop: %s
                Current risk level: %s
                
                Provide:
                1. Most likely pests/diseases in next 2 weeks
                2. Early warning signs to watch for
                3. Preventive spray schedule
                4. Emergency response plan if outbreak occurs
                """,
                input.toString(),
                String.join(", ", pests),
                riskLevel
        );
    }

    private String buildResourceOptimizationPrompt(Map<String, Object> input,
            List<String> waterAdvice, List<String> nutrientAdvice) {
        return String.format("""
                Optimize resource usage for this farm:
                
                Farm Data: %s
                Water Status: %s
                Nutrient Status: %s
                
                Provide an optimization plan covering:
                1. Irrigation schedule (frequency, duration, method)
                2. Fertilizer application plan (products, doses, timing)
                3. Labor allocation recommendations
                4. Cost reduction opportunities
                5. Expected ROI improvement
                """,
                input.toString(),
                String.join("; ", waterAdvice.subList(0, Math.min(3, waterAdvice.size()))),
                String.join("; ", nutrientAdvice.subList(0, Math.min(3, nutrientAdvice.size())))
        );
    }

    private String buildReportPrompt(Map<String, Object> farmData, Map<String, Object> analysis,
            Map<String, Object> health, List<Map<String, Object>> alerts) {
        return String.format("""
                Generate a comprehensive farm management report:
                
                Farm Data: %s
                Health Score: %s/100
                Status: %s
                Active Alerts: %d
                
                Write a professional report with:
                1. Executive Summary
                2. Current Farm Status Assessment
                3. Critical Issues Requiring Immediate Attention
                4. 30-Day Action Plan
                5. Seasonal Outlook
                6. Financial Impact Assessment
                7. Recommendations for Next Season
                """,
                farmData.toString(),
                health.getOrDefault("overallScore", 0),
                health.getOrDefault("status", "Unknown"),
                alerts.size()
        );
    }

    // ── Rule-Based Fallbacks ──────────────────────────────────────────────────

    private String generateRuleBasedAnswer(String question) {
        String q = question.toLowerCase();
        StringBuilder answer = new StringBuilder();

        // Crop queries
        String[] crops = {"rice", "wheat", "maize", "cotton", "sugarcane", "tomato", "potato", "onion", "chickpea"};
        for (String crop : crops) {
            if (q.contains(crop)) {
                CropKnowledge.CropData cropData = CropKnowledge.getCropData(crop);
                if (cropData != null) {
                    answer.append("**").append(cropData.name).append(" Cultivation Guide:**\n\n");
                    answer.append("📅 **Season:** ").append(cropData.seasons).append("\n");
                    answer.append("🌱 **Soil:** ").append(cropData.suitableSoilTypes).append("\n");
                    answer.append("⚗️ **pH Range:** ").append(cropData.minPH).append(" – ").append(cropData.maxPH).append("\n");
                    answer.append("💧 **Rainfall:** ").append(cropData.minRainfall).append("–").append(cropData.maxRainfall).append(" mm\n");
                    answer.append("🌡️ **Temperature:** ").append(cropData.minTemp).append("–").append(cropData.maxTemp).append("°C\n");
                    answer.append("⏱️ **Duration:** ").append(cropData.durationDays).append(" days\n");
                    answer.append("💊 **NPK (kg/ha):** N=").append(cropData.nitrogenRequired)
                            .append(", P=").append(cropData.phosphorusRequired)
                            .append(", K=").append(cropData.potassiumRequired).append("\n");
                    if (!cropData.diseases.isEmpty()) {
                        answer.append("🦠 **Common Diseases:** ").append(String.join(", ", cropData.diseases)).append("\n");
                    }
                    if (!cropData.pests.isEmpty()) {
                        answer.append("🐛 **Common Pests:** ").append(String.join(", ", cropData.pests)).append("\n");
                    }
                    return answer.toString();
                }
            }
        }

        // Pest/disease queries
        if (q.contains("pest") || q.contains("disease") || q.contains("insect") || q.contains("fungus")) {
            answer.append("**Pest & Disease Management:**\n\n");
            answer.append("Common pests in Indian agriculture:\n");
            for (String name : PestDiseaseKnowledge.getAllNames()) {
                answer.append("• ").append(name).append("\n");
            }
            answer.append("\nFor specific treatment, please provide the pest name and affected crop.");
            return answer.toString();
        }

        // Soil queries
        if (q.contains("soil") || q.contains("ph") || q.contains("nitrogen") || q.contains("fertilizer")) {
            answer.append("**Soil Health Guide:**\n\n");
            answer.append("• **Optimal pH:** 6.0–7.5 for most crops\n");
            answer.append("• **Nitrogen (N):** 280–450 kg/ha optimal\n");
            answer.append("• **Phosphorus (P):** 11–56 kg/ha optimal\n");
            answer.append("• **Potassium (K):** 110–340 kg/ha optimal\n");
            answer.append("• **Organic Carbon:** >0.75% for good soil health\n\n");
            answer.append("Submit a soil test report for personalized recommendations.");
            return answer.toString();
        }

        // Season queries
        if (q.contains("kharif") || q.contains("rabi") || q.contains("season")) {
            answer.append("**Indian Crop Seasons:**\n\n");
            answer.append("🌧️ **Kharif (June–October):** Rice, Maize, Cotton, Sugarcane, Soybean\n");
            answer.append("❄️ **Rabi (October–March):** Wheat, Chickpea, Mustard, Potato, Onion\n");
            answer.append("☀️ **Zaid (March–June):** Watermelon, Cucumber, Vegetables\n\n");
            answer.append("Ask about any specific crop for detailed cultivation guidance.");
            return answer.toString();
        }

        // Default response
        return """
                I'm GreenX AI, your agricultural intelligence assistant. I can help with:
                
                🌾 **Crop Information** — Ask about any crop (rice, wheat, cotton, etc.)
                🐛 **Pest & Disease** — Identify and treat crop problems
                🧪 **Soil Analysis** — Interpret soil test results
                💧 **Irrigation** — Water management recommendations
                💊 **Fertilizers** — NPK schedules and organic alternatives
                📅 **Season Planning** — Kharif, Rabi, Zaid crop selection
                💰 **Market Prices** — MSP and selling strategies
                
                Please ask a specific question about your farm or crops!
                """;
    }

    private String buildRuleBasedNarrative(Map<String, Object> farmData, Map<String, Object> analysis) {
        @SuppressWarnings("unchecked")
        Map<String, Object> summary = (Map<String, Object>) analysis.getOrDefault("summary", new HashMap<>());
        @SuppressWarnings("unchecked")
        List<String> recommendations = (List<String>) analysis.getOrDefault("recommendations", new ArrayList<>());
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> alerts = (List<Map<String, Object>>) analysis.getOrDefault("alerts", new ArrayList<>());

        int healthScore = toInt(summary.getOrDefault("overallHealth", 50));
        String riskLevel = (String) summary.getOrDefault("riskLevel", "medium");

        StringBuilder narrative = new StringBuilder();
        narrative.append("**Farm Analysis Summary**\n\n");
        narrative.append("Overall farm health score: **").append(healthScore).append("/100** (").append(riskLevel.toUpperCase()).append(" risk)\n\n");

        if (!alerts.isEmpty()) {
            narrative.append("**Active Alerts (").append(alerts.size()).append("):**\n");
            alerts.stream().limit(3).forEach(a ->
                    narrative.append("• ").append(a.get("title")).append(": ").append(a.get("message")).append("\n")
            );
            narrative.append("\n");
        }

        if (!recommendations.isEmpty()) {
            narrative.append("**Top Recommendations:**\n");
            recommendations.stream().limit(5).forEach(r -> narrative.append("• ").append(r).append("\n"));
        }

        return narrative.toString();
    }

    private String buildRuleBasedCropAdvice(List<String> crops, Map<String, Object> soilInfo) {
        StringBuilder advice = new StringBuilder();
        advice.append("**Crop Recommendations Based on Soil Analysis:**\n\n");
        crops.stream().limit(5).forEach(c -> advice.append("• ").append(c).append("\n"));
        advice.append("\n**Your Soil Characteristics:**\n");
        advice.append("• Water Holding: ").append(soilInfo.getOrDefault("waterHolding", "Moderate")).append("\n");
        advice.append("• Drainage: ").append(soilInfo.getOrDefault("drainage", "Good")).append("\n");
        advice.append("• Fertility: ").append(soilInfo.getOrDefault("fertility", "Moderate")).append("\n");
        return advice.toString();
    }

    private String buildRuleBasedOptimizationSummary(List<String> waterAdvice, List<String> nutrientAdvice) {
        StringBuilder summary = new StringBuilder();
        summary.append("**Resource Optimization Plan:**\n\n");
        summary.append("**Water Management:**\n");
        waterAdvice.stream().limit(4).forEach(a -> summary.append("• ").append(a).append("\n"));
        summary.append("\n**Nutrient Management:**\n");
        nutrientAdvice.stream().limit(4).forEach(a -> summary.append("• ").append(a).append("\n"));
        return summary.toString();
    }

    private String buildRuleBasedReport(Map<String, Object> farmData, Map<String, Object> analysis,
            Map<String, Object> health, List<Map<String, Object>> alerts) {
        StringBuilder report = new StringBuilder();
        report.append("# GreenX Farm Management Report\n\n");
        report.append("**Generated:** ").append(LocalDateTime.now()).append("\n\n");
        report.append("## Executive Summary\n");
        report.append("Farm health score: **").append(health.getOrDefault("overallScore", 0)).append("/100**\n");
        report.append("Status: **").append(health.getOrDefault("status", "Unknown")).append("**\n");
        report.append("Active alerts: **").append(alerts.size()).append("**\n\n");

        if (!alerts.isEmpty()) {
            report.append("## Critical Issues\n");
            alerts.stream()
                    .filter(a -> "high".equals(a.get("severity")))
                    .limit(5)
                    .forEach(a -> report.append("🔴 **").append(a.get("title")).append(":** ").append(a.get("message")).append("\n"));
            report.append("\n");
        }

        @SuppressWarnings("unchecked")
        List<String> recommendations = (List<String>) analysis.getOrDefault("recommendations", new ArrayList<>());
        if (!recommendations.isEmpty()) {
            report.append("## Recommendations\n");
            recommendations.forEach(r -> report.append("• ").append(r).append("\n"));
        }

        return report.toString();
    }

    // ── Helper Methods ────────────────────────────────────────────────────────

    private Map<String, Object> buildFertilizerPlan(Map<String, Double> cropNeeds,
            double currentN, double currentP, double currentK, double areaAcres) {
        Map<String, Object> plan = new HashMap<>();
        if (cropNeeds == null) {
            plan.put("note", "Crop not found in database. Use general NPK guidelines.");
            return plan;
        }

        double nNeeded = Math.max(0, cropNeeds.getOrDefault("nitrogen", 120.0) - currentN);
        double pNeeded = Math.max(0, cropNeeds.getOrDefault("phosphorus", 40.0) - currentP);
        double kNeeded = Math.max(0, cropNeeds.getOrDefault("potassium", 40.0) - currentK);

        plan.put("nitrogenDeficit", nNeeded);
        plan.put("phosphorusDeficit", pNeeded);
        plan.put("potassiumDeficit", kNeeded);
        plan.put("ureaRequired_kg", Math.round(nNeeded * 2.17 * areaAcres));
        plan.put("dapRequired_kg", Math.round(pNeeded * 2.17 * areaAcres));
        plan.put("mopRequired_kg", Math.round(kNeeded * 1.67 * areaAcres));
        plan.put("applicationSchedule", List.of(
                "Basal dose (at sowing): 50% N + 100% P + 100% K",
                "Top dressing 1 (30 DAS): 25% N",
                "Top dressing 2 (60 DAS): 25% N"
        ));

        return plan;
    }

    private Map<String, Object> buildLaborPlan(String cropName, double areaAcres) {
        Map<String, Object> plan = new HashMap<>();
        int laborDaysPerAcre = 15; // average
        plan.put("estimatedLaborDays", Math.round(laborDaysPerAcre * areaAcres));
        plan.put("peakLaborPeriods", List.of("Sowing/Transplanting", "Weeding (20-40 DAS)", "Harvesting"));
        plan.put("mechanizationOpportunities", List.of("Tractor ploughing", "Seed drill sowing", "Combine harvesting"));
        return plan;
    }

    private Map<String, Object> calculateEstimatedSavings(double currentN, double currentP, double currentK,
            Map<String, Double> cropNeeds, double areaAcres) {
        Map<String, Object> savings = new HashMap<>();
        if (cropNeeds == null) return savings;

        double optimalN = cropNeeds.getOrDefault("nitrogen", 120.0);
        double excessN = Math.max(0, currentN - optimalN);
        double fertilizerSavings = excessN * 0.5 * areaAcres; // rough estimate in kg
        savings.put("fertilizerSavingsKg", Math.round(fertilizerSavings));
        savings.put("estimatedCostSavingsINR", Math.round(fertilizerSavings * 15)); // ~₹15/kg urea
        savings.put("waterSavingsPct", currentN > optimalN ? 10 : 0);
        return savings;
    }

    private List<String> buildPestPreventionPlan(String cropName, String riskLevel, double temp, double humidity) {
        List<String> plan = new ArrayList<>();
        if ("HIGH".equals(riskLevel)) {
            plan.add("🚨 HIGH RISK: Begin preventive spray program immediately");
            plan.add("Apply broad-spectrum insecticide as prophylactic measure");
            plan.add("Install pheromone traps @ 15-20 per hectare");
            plan.add("Scout fields every 2-3 days for early detection");
        } else if ("MEDIUM".equals(riskLevel)) {
            plan.add("⚠️ MEDIUM RISK: Increase field monitoring frequency");
            plan.add("Install yellow sticky traps for whitefly/aphid monitoring");
            plan.add("Keep pesticides ready for emergency application");
            plan.add("Scout fields weekly");
        } else {
            plan.add("✅ LOW RISK: Continue routine monitoring");
            plan.add("Monthly field scouting sufficient");
            plan.add("Maintain field hygiene — remove crop debris");
        }

        if (humidity > 80) {
            plan.add("High humidity detected — apply preventive fungicide");
        }
        if (temp > 30) {
            plan.add("High temperature — increased insect activity expected");
        }

        return plan;
    }

    private int calculatePestRiskScore(double temp, double humidity, double rainfall, int knownPestCount) {
        int score = 20; // baseline
        if (humidity > 80) score += 25;
        else if (humidity > 70) score += 15;
        if (temp > 28 && temp < 35) score += 20;
        if (rainfall > 50) score += 15;
        score += Math.min(20, knownPestCount * 4);
        return Math.min(100, score);
    }

    private Map<String, Object> buildSoilAnalysisSection(Map<String, Object> farmData) {
        Map<String, Object> section = new HashMap<>();
        section.put("ph", farmData.getOrDefault("soil_ph", "N/A"));
        section.put("nitrogen", farmData.getOrDefault("soil_nitrogen", "N/A"));
        section.put("phosphorus", farmData.getOrDefault("soil_phosphorus", "N/A"));
        section.put("potassium", farmData.getOrDefault("soil_potassium", "N/A"));
        section.put("organicCarbon", farmData.getOrDefault("soil_organic_carbon", "N/A"));
        section.put("moisture", farmData.getOrDefault("soil_moisture", "N/A"));

        // Add recommendations
        double ph = toDouble(farmData.getOrDefault("soil_ph", 7.0));
        section.put("phRecommendations", SoilAnalysisKnowledge.analyzePH(ph));

        return section;
    }

    private String determineSeverity(Map<String, Object> analysis) {
        @SuppressWarnings("unchecked")
        Map<String, Object> summary = (Map<String, Object>) analysis.getOrDefault("summary", new HashMap<>());
        int score = toInt(summary.getOrDefault("overallHealth", 50));
        if (score >= 80) return "INFO";
        if (score >= 60) return "WARNING";
        return "CRITICAL";
    }

    private String calculateRiskLevel(Map<String, Object> health) {
        int score = toInt(health.getOrDefault("overallScore", 50));
        if (score >= 80) return "LOW";
        if (score >= 60) return "MEDIUM";
        if (score >= 40) return "HIGH";
        return "CRITICAL";
    }

    private String buildInsightSummary(Map<String, Object> analysis) {
        @SuppressWarnings("unchecked")
        Map<String, Object> summary = (Map<String, Object>) analysis.getOrDefault("summary", new HashMap<>());
        int score = toInt(summary.getOrDefault("overallHealth", 50));
        String risk = (String) summary.getOrDefault("riskLevel", "medium");
        @SuppressWarnings("unchecked")
        List<?> alerts = (List<?>) analysis.getOrDefault("alerts", List.of());
        return String.format("Health: %d/100, Risk: %s, Alerts: %d", score, risk.toUpperCase(), alerts.size());
    }

    private void persistInsight(String farmId, String userId, String category,
            String severity, String title, String summary, String details) {
        try {
            AiInsight insight = AiInsight.builder()
                    .farmId(farmId)
                    .userId(userId)
                    .category(category)
                    .severity(severity)
                    .title(title)
                    .summary(summary)
                    .details(details)
                    .confidenceScore(isOpenAiConfigured() ? 90 : 75)
                    .expiresAt(LocalDateTime.now().plusDays(7))
                    .build();
            insightRepository.save(insight);
        } catch (Exception e) {
            log.warn("Failed to persist AI insight: {}", e.getMessage());
        }
    }

    private Map<String, Object> insightToMap(AiInsight insight) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", insight.getId());
        map.put("farmId", insight.getFarmId());
        map.put("userId", insight.getUserId());
        map.put("category", insight.getCategory());
        map.put("severity", insight.getSeverity());
        map.put("title", insight.getTitle());
        map.put("summary", insight.getSummary());
        map.put("details", insight.getDetails());
        map.put("confidenceScore", insight.getConfidenceScore());
        map.put("isRead", insight.getIsRead());
        map.put("createdAt", insight.getCreatedAt() != null ? insight.getCreatedAt().toString() : "");
        return map;
    }

    private SoilAnalysisKnowledge.SoilType parseSoilType(String soilTypeStr) {
        try {
            return SoilAnalysisKnowledge.SoilType.valueOf(soilTypeStr.toUpperCase().replace(" ", "_"));
        } catch (Exception e) {
            return SoilAnalysisKnowledge.SoilType.LOAMY;
        }
    }

    private CropKnowledge.Season parseSeason(String seasonStr) {
        try {
            return CropKnowledge.Season.valueOf(seasonStr.toUpperCase());
        } catch (Exception e) {
            return CropKnowledge.Season.KHARIF;
        }
    }

    private String currentSeason() {
        int month = LocalDateTime.now().getMonthValue();
        if (month >= 6 && month <= 10) return "KHARIF";
        if (month >= 11 || month <= 2) return "RABI";
        return "ZAID";
    }

    private double toDouble(Object value) {
        if (value == null) return 0.0;
        if (value instanceof Number) return ((Number) value).doubleValue();
        try { return Double.parseDouble(value.toString()); } catch (Exception e) { return 0.0; }
    }

    private int toInt(Object value) {
        if (value == null) return 0;
        if (value instanceof Number) return ((Number) value).intValue();
        try { return Integer.parseInt(value.toString()); } catch (Exception e) { return 0; }
    }
}
