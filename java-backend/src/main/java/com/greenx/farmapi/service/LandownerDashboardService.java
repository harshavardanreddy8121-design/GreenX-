package com.greenx.farmapi.service;

import com.greenx.farmapi.entity.*;
import com.greenx.farmapi.model.User;
import com.greenx.farmapi.repository.*;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LandownerDashboardService {

    private static final Logger log = LoggerFactory.getLogger(LandownerDashboardService.class);

    private final FarmRepository farmRepository;
    private final SoilReportRepository soilReportRepository;
    private final CropSuggestionRepository cropSuggestionRepository;
    private final FieldUpdateRepository fieldUpdateRepository;
    private final SiteVisitReportRepository siteVisitReportRepository;
    private final UserRepository userRepository;

    // ── MODULE 1: Overview Dashboard ─────────────────────────────────────────

    public Map<String, Object> getOverviewData(String landownerId) {
        log.debug("Fetching overview data for landowner: {}", landownerId);
        List<Farm> farms = farmRepository.findByOwnerId(landownerId);

        // Handle null or empty farms list
        if (farms == null || farms.isEmpty()) {
            log.info("No farms found for landowner: {}", landownerId);
            Map<String, Object> empty = new LinkedHashMap<>();
            empty.put("totalLandArea", 0.0);
            empty.put("totalInputCosts", 0.0);
            empty.put("totalSoilSamples", 0);
            empty.put("activeFarms", 0);
            empty.put("totalFarms", 0);
            empty.put("message", "No farms registered yet");
            return empty;
        }

        List<String> farmIds = farms.stream().map(Farm::getId).toList();
        log.debug("Found {} farm(s) for landowner: {}", farms.size(), landownerId);

        double totalLand = farms.stream()
                .mapToDouble(f -> f.getTotalLand() != null ? f.getTotalLand() : 0.0)
                .sum();

        BigDecimal totalCosts = BigDecimal.ZERO;
        if (!farmIds.isEmpty()) {
            List<FieldUpdate> expenses = fieldUpdateRepository
                    .findByFarmIdInAndTransactionType(farmIds, "expense");
            totalCosts = expenses.stream()
                    .map(f -> f.getAmount() != null ? f.getAmount() : BigDecimal.ZERO)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
        }

        long totalSamples = farmIds.isEmpty() ? 0 : soilReportRepository.countByFarmIdIn(farmIds);

        long activeFarms = farms.stream()
                .filter(f -> f.getStatus() == null || !"INACTIVE".equalsIgnoreCase(f.getStatus()))
                .count();

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("totalLandArea", totalLand);
        result.put("totalInputCosts", totalCosts.doubleValue());
        result.put("totalSoilSamples", totalSamples);
        result.put("activeFarms", activeFarms);
        result.put("totalFarms", farms.size());
        log.debug("Overview data: totalLand={}, activeFarms={}, totalSamples={}", totalLand, activeFarms, totalSamples);
        return result;
    }

    // ── MODULE 2: Soil Samples ────────────────────────────────────────────────

    public Map<String, Object> getSoilSamples(String landownerId) {
        List<Farm> farms = farmRepository.findByOwnerId(landownerId);
        List<String> farmIds = farms.stream().map(Farm::getId).toList();

        if (farmIds.isEmpty()) {
            return Map.of("totalSamples", 0, "samples", List.of());
        }

        Map<String, String> farmNames = farms.stream()
                .collect(Collectors.toMap(Farm::getId, f -> f.getName() != null ? f.getName() : "Unknown"));

        List<SoilReport> reports = soilReportRepository.findByFarmIdInOrderByCreatedAtDesc(farmIds);

        List<Map<String, Object>> samples = reports.stream().map(report -> {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("id", report.getId());
            item.put("farmId", report.getFarmId());
            item.put("farmName", farmNames.getOrDefault(report.getFarmId(), "Unknown"));
            item.put("collectionDate", report.getReportDate());
            item.put("status", "Report Generated");
            item.put("reportId", report.getId());
            return item;
        }).toList();

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("totalSamples", samples.size());
        result.put("samples", samples);
        return result;
    }

    // ── MODULE 3: Latest Soil Reports ─────────────────────────────────────────

    public Map<String, Object> getLatestSoilReports(String landownerId, int limit) {
        List<Farm> farms = farmRepository.findByOwnerId(landownerId);
        List<String> farmIds = farms.stream().map(Farm::getId).toList();

        if (farmIds.isEmpty()) {
            return Map.of("reports", List.of());
        }

        Map<String, String> farmNames = farms.stream()
                .collect(Collectors.toMap(Farm::getId, f -> f.getName() != null ? f.getName() : "Unknown"));

        List<SoilReport> reports = soilReportRepository
                .findByFarmIdInOrderByCreatedAtDesc(farmIds)
                .stream()
                .limit(limit)
                .toList();

        List<Map<String, Object>> reportList = reports.stream().map(report -> {
            String expertName = "Unknown";
            if (report.getExpertId() != null) {
                expertName = userRepository.findById(report.getExpertId())
                        .map(User::getName)
                        .orElse("Unknown");
            }

            Map<String, Object> item = new LinkedHashMap<>();
            item.put("id", report.getId());
            item.put("farmId", report.getFarmId());
            item.put("farmName", farmNames.getOrDefault(report.getFarmId(), "Unknown"));
            item.put("submittedDate", report.getCreatedAt());
            item.put("reportDate", report.getReportDate());
            item.put("ph", report.getPhLevel());
            item.put("nitrogen", report.getNitrogenKgHa());
            item.put("phosphorus", report.getPhosphorusKgHa());
            item.put("potassium", report.getPotassiumKgHa());
            item.put("organicMatter", report.getOrganicMatterPct());
            item.put("moisture", report.getMoisturePct());
            item.put("ec", report.getEcDsM());
            item.put("zinc", report.getZincPpm());
            item.put("boron", report.getBoronPpm());
            item.put("sulphur", report.getSulphurPpm());
            item.put("overallRating", report.getOverallRating());
            item.put("notes", report.getExpertRemarks());
            item.put("expertName", expertName);
            return item;
        }).toList();

        return Map.of("reports", reportList);
    }

    // ── MODULE 4: Crop Suggestions ────────────────────────────────────────────

    public Map<String, Object> getCropSuggestions(String landownerId) {
        List<Farm> farms = farmRepository.findByOwnerId(landownerId);
        List<String> farmIds = farms.stream().map(Farm::getId).toList();

        if (farmIds.isEmpty()) {
            return Map.of("suggestions", List.of());
        }

        Map<String, String> farmNames = farms.stream()
                .collect(Collectors.toMap(Farm::getId, f -> f.getName() != null ? f.getName() : "Unknown"));

        List<CropSuggestion> suggestions = cropSuggestionRepository
                .findByFarmIdInOrderByCreatedAtDesc(farmIds);

        List<Map<String, Object>> suggestionList = suggestions.stream().map(suggestion -> {
            String expertName = "Unknown";
            if (suggestion.getExpertId() != null) {
                expertName = userRepository.findById(suggestion.getExpertId())
                        .map(User::getName)
                        .orElse("Unknown");
            }

            Map<String, Object> item = new LinkedHashMap<>();
            item.put("id", suggestion.getId());
            item.put("farmId", suggestion.getFarmId());
            item.put("farmName", farmNames.getOrDefault(suggestion.getFarmId(), "Unknown"));
            item.put("cropName", suggestion.getCropName());
            item.put("variety", suggestion.getCropVariety());
            item.put("season", suggestion.getSeason());
            item.put("expectedYieldMin", suggestion.getExpectedYieldMin());
            item.put("expectedYieldMax", suggestion.getExpectedYieldMax());
            item.put("yieldUnit", suggestion.getYieldUnit());
            item.put("profitPerAcre", suggestion.getProfitPerAcre());
            item.put("inputCostEstimate", suggestion.getInputCostEstimate());
            item.put("durationDays", suggestion.getDurationDays());
            item.put("suitabilityScore", suggestion.getSuitabilityScore());
            item.put("reasoning", suggestion.getExpertNotes());
            item.put("isSelected", suggestion.isSelected());
            item.put("submittedDate", suggestion.getCreatedAt());
            item.put("expertName", expertName);
            return item;
        }).toList();

        return Map.of("suggestions", suggestionList);
    }

    // ── MODULE 5: Soil Sample Timeline ────────────────────────────────────────

    public Map<String, Object> getSoilTimeline(String landownerId) {
        List<Farm> farms = farmRepository.findByOwnerId(landownerId);
        List<String> farmIds = farms.stream().map(Farm::getId).toList();

        Optional<SiteVisitReport> latestVisit = Optional.empty();
        Optional<SoilReport> latestReport = Optional.empty();

        if (!farmIds.isEmpty()) {
            List<SiteVisitReport> visits = siteVisitReportRepository
                    .findByFarmIdInOrderByVisitDateDesc(farmIds);
            latestVisit = visits.stream().findFirst();

            List<SoilReport> reports = soilReportRepository
                    .findByFarmIdInOrderByCreatedAtDesc(farmIds);
            latestReport = reports.stream().findFirst();
        }

        List<Map<String, Object>> timeline = new ArrayList<>();

        // Stage 1: Sample Requested
        Map<String, Object> stage1 = new LinkedHashMap<>();
        stage1.put("stage", "Sample Requested");
        stage1.put("date", latestVisit.map(v -> v.getVisitDate().toString()).orElse(null));
        stage1.put("status", latestVisit.isPresent() ? "completed" : "pending");
        stage1.put("description", "Field manager requested soil sample");
        timeline.add(stage1);

        // Stage 2: Sample Collected
        Map<String, Object> stage2 = new LinkedHashMap<>();
        stage2.put("stage", "Sample Collected");
        stage2.put("date", latestVisit.map(v -> v.getVisitDate().toString()).orElse(null));
        stage2.put("status", latestVisit.map(v -> v.isSoilSampleCollected() ? "completed" : "pending").orElse("pending"));
        stage2.put("description", "Soil sample collected from field");
        timeline.add(stage2);

        // Stage 3: Lab Testing
        Map<String, Object> stage3 = new LinkedHashMap<>();
        stage3.put("stage", "Lab Testing");
        stage3.put("date", latestReport.map(r -> r.getReportDate() != null ? r.getReportDate().toString() : null).orElse(null));
        stage3.put("status", latestReport.isPresent() ? "completed" : (latestVisit.isPresent() ? "in_progress" : "pending"));
        stage3.put("description", "Sample sent to lab for analysis");
        timeline.add(stage3);

        // Stage 4: Report Generated
        Map<String, Object> stage4 = new LinkedHashMap<>();
        stage4.put("stage", "Report Generated");
        stage4.put("date", latestReport.map(r -> r.getCreatedAt() != null ? r.getCreatedAt().toString() : null).orElse(null));
        stage4.put("status", latestReport.isPresent() ? "completed" : "pending");
        stage4.put("description", "Lab results received and report generated");
        timeline.add(stage4);

        // Stage 5: Report Delivered
        Map<String, Object> stage5 = new LinkedHashMap<>();
        stage5.put("stage", "Report Delivered");
        stage5.put("date", latestReport.map(r -> r.getCreatedAt() != null ? r.getCreatedAt().toString() : null).orElse(null));
        stage5.put("status", latestReport.isPresent() ? "completed" : "pending");
        stage5.put("description", "Report delivered to you");
        timeline.add(stage5);

        return Map.of("timeline", timeline);
    }

    // ── MODULE 6: Finance Summary ─────────────────────────────────────────────

    public Map<String, Object> getFinanceSummary(String landownerId) {
        List<Farm> farms = farmRepository.findByOwnerId(landownerId);
        List<String> farmIds = farms.stream().map(Farm::getId).toList();

        if (farmIds.isEmpty()) {
            Map<String, Object> empty = new LinkedHashMap<>();
            empty.put("totalInvestment", 0.0);
            empty.put("revenue", 0.0);
            empty.put("profitLoss", 0.0);
            empty.put("profitMargin", 0.0);
            empty.put("expenses", Map.of());
            empty.put("breakdown", List.of());
            return empty;
        }

        List<FieldUpdate> expenses = fieldUpdateRepository
                .findByFarmIdInAndTransactionType(farmIds, "expense");
        List<FieldUpdate> incomeEntries = fieldUpdateRepository
                .findByFarmIdInAndTransactionType(farmIds, "income");

        BigDecimal totalExpenses = expenses.stream()
                .map(f -> f.getAmount() != null ? f.getAmount() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalIncome = incomeEntries.stream()
                .map(f -> f.getAmount() != null ? f.getAmount() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal profitLoss = totalIncome.subtract(totalExpenses);
        double profitMargin = totalIncome.doubleValue() > 0
                ? (profitLoss.doubleValue() / totalIncome.doubleValue()) * 100
                : 0.0;

        // Group expenses by updateType for breakdown
        Map<String, BigDecimal> expenseByType = expenses.stream()
                .collect(Collectors.groupingBy(
                        f -> f.getUpdateType() != null ? f.getUpdateType() : "Other",
                        Collectors.reducing(
                                BigDecimal.ZERO,
                                f -> f.getAmount() != null ? f.getAmount() : BigDecimal.ZERO,
                                BigDecimal::add
                        )
                ));

        Map<String, Double> expensesMap = new LinkedHashMap<>();
        expenseByType.forEach((type, amount) -> expensesMap.put(type, amount.doubleValue()));

        double totalExpensesDouble = totalExpenses.doubleValue();
        List<Map<String, Object>> breakdown = expenseByType.entrySet().stream()
                .map(entry -> {
                    Map<String, Object> item = new LinkedHashMap<>();
                    item.put("category", entry.getKey());
                    item.put("amount", entry.getValue().doubleValue());
                    item.put("percentage", totalExpensesDouble > 0
                            ? Math.round((entry.getValue().doubleValue() / totalExpensesDouble) * 100)
                            : 0);
                    return item;
                })
                .sorted(Comparator.comparingDouble(m -> -((Number) m.get("amount")).doubleValue()))
                .toList();

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("totalInvestment", totalExpensesDouble);
        result.put("expenses", expensesMap);
        result.put("revenue", totalIncome.doubleValue());
        result.put("profitLoss", profitLoss.doubleValue());
        result.put("profitMargin", profitMargin);
        result.put("breakdown", breakdown);
        return result;
    }
}
