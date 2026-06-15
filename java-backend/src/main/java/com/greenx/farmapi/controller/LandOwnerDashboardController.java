package com.greenx.farmapi.controller;

import com.greenx.farmapi.dto.ApiResponse;
import com.greenx.farmapi.entity.*;
import com.greenx.farmapi.model.User;
import com.greenx.farmapi.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Dashboard-specific endpoints for the Landowner role.
 * All paths are under /landowner/dashboard/** and are secured to LAND_OWNER / LANDOWNER roles.
 */
@RestController
@RequestMapping("/landowner/dashboard")
@RequiredArgsConstructor
@PreAuthorize("hasRole('LAND_OWNER') or hasRole('LANDOWNER')")
public class LandOwnerDashboardController {

    private final FarmRepository farmRepository;
    private final SoilSampleRepository soilSampleRepository;
    private final SoilReportRepository soilReportRepository;
    private final CropSuggestionRepository cropSuggestionRepository;
    private final FieldUpdateRepository fieldUpdateRepository;
    private final ScheduleItemRepository scheduleItemRepository;
    private final FieldOperationRepository fieldOperationRepository;

    // ─── Helper ──────────────────────────────────────────────────────────────

    private List<String> getFarmIds(String ownerId) {
        return farmRepository.findByOwnerId(ownerId)
                .stream()
                .map(Farm::getId)
                .collect(Collectors.toList());
    }

    // ─── GET /landowner/dashboard/overview ───────────────────────────────────

    /**
     * Returns high-level stats: totalLand, totalCosts, totalSamples, farmCount.
     */
    @GetMapping("/overview")
    public ApiResponse<Map<String, Object>> getOverview(Authentication auth) {
        try {
            User user = (User) auth.getPrincipal();
            List<Farm> farms = farmRepository.findByOwnerId(user.getId());
            List<String> farmIds = farms.stream().map(Farm::getId).collect(Collectors.toList());

            double totalLand = farms.stream()
                    .mapToDouble(f -> f.getTotalLand() != null ? f.getTotalLand() : 0.0)
                    .sum();

            BigDecimal totalCosts = BigDecimal.ZERO;
            for (Farm farm : farms) {
                BigDecimal cost = fieldOperationRepository.sumCostByFarmId(farm.getId());
                if (cost != null) totalCosts = totalCosts.add(cost);
            }

            long totalSamples = farmIds.isEmpty() ? 0L :
                    soilSampleRepository.findByFarmIdIn(farmIds).size();

            Map<String, Object> overview = new LinkedHashMap<>();
            overview.put("totalLand", totalLand);
            overview.put("totalCosts", totalCosts);
            overview.put("totalSamples", totalSamples);
            overview.put("farmCount", farms.size());

            return ApiResponse.success(overview);
        } catch (Exception e) {
            return ApiResponse.error("Failed to load overview: " + e.getMessage());
        }
    }

    // ─── GET /landowner/dashboard/soil-samples ────────────────────────────────

    /**
     * Returns all soil samples for the landowner's farms, sorted newest first.
     */
    @GetMapping("/soil-samples")
    public ApiResponse<List<SoilSample>> getSoilSamples(Authentication auth) {
        try {
            User user = (User) auth.getPrincipal();
            List<String> farmIds = getFarmIds(user.getId());
            if (farmIds.isEmpty()) return ApiResponse.success(List.of());

            List<SoilSample> samples = soilSampleRepository.findByFarmIdIn(farmIds);
            samples.sort(Comparator.comparing(SoilSample::getCreatedAt,
                    Comparator.nullsLast(Comparator.reverseOrder())));
            return ApiResponse.success(samples);
        } catch (Exception e) {
            return ApiResponse.error("Failed to load soil samples: " + e.getMessage());
        }
    }

    // ─── GET /landowner/dashboard/soil-reports ────────────────────────────────

    /**
     * Returns all soil reports shared with the landowner, sorted newest first.
     */
    @GetMapping("/soil-reports")
    public ApiResponse<List<SoilReport>> getSoilReports(Authentication auth) {
        try {
            User user = (User) auth.getPrincipal();
            List<String> farmIds = getFarmIds(user.getId());
            if (farmIds.isEmpty()) return ApiResponse.success(List.of());

            List<SoilReport> reports = soilReportRepository.findByFarmIdIn(farmIds)
                    .stream()
                    .filter(SoilReport::isShareLandowner)
                    .collect(Collectors.toList());
            reports.sort(Comparator.comparing(SoilReport::getCreatedAt,
                    Comparator.nullsLast(Comparator.reverseOrder())));
            return ApiResponse.success(reports);
        } catch (Exception e) {
            return ApiResponse.error("Failed to load soil reports: " + e.getMessage());
        }
    }

    // ─── GET /landowner/dashboard/crop-suggestions ────────────────────────────

    /**
     * Returns all crop suggestions for the landowner's farms, sorted newest first.
     */
    @GetMapping("/crop-suggestions")
    public ApiResponse<List<CropSuggestion>> getCropSuggestions(Authentication auth) {
        try {
            User user = (User) auth.getPrincipal();
            List<String> farmIds = getFarmIds(user.getId());
            if (farmIds.isEmpty()) return ApiResponse.success(List.of());

            List<CropSuggestion> suggestions = cropSuggestionRepository.findByFarmIdIn(farmIds);
            suggestions.sort(Comparator.comparing(CropSuggestion::getCreatedAt,
                    Comparator.nullsLast(Comparator.reverseOrder())));
            return ApiResponse.success(suggestions);
        } catch (Exception e) {
            return ApiResponse.error("Failed to load crop suggestions: " + e.getMessage());
        }
    }

    // ─── GET /landowner/dashboard/farms/{farmId}/soil-timeline ───────────────

    /**
     * Returns the soil sample processing timeline for a specific farm.
     * Stages: Sample Requested → Sample Collected → Lab Testing → Report Generated → Report Delivered
     */
    @GetMapping("/farms/{farmId}/soil-timeline")
    public ApiResponse<List<Map<String, Object>>> getSoilTimeline(
            @PathVariable String farmId,
            Authentication auth) {
        try {
            User user = (User) auth.getPrincipal();

            // Verify ownership
            Farm farm = farmRepository.findById(farmId).orElse(null);
            if (farm == null) return ApiResponse.error("Farm not found");
            if (!farm.getOwnerId().equals(user.getId()))
                return ApiResponse.error("Access denied to this farm");

            List<SoilSample> samples = soilSampleRepository.findByFarmId(farmId);
            List<SoilReport> reports = soilReportRepository.findByFarmIdAndShareLandownerTrue(farmId);

            // Build timeline stages
            List<Map<String, Object>> timeline = new ArrayList<>();

            // Stage 1: Sample Requested
            Map<String, Object> stage1 = new LinkedHashMap<>();
            stage1.put("stage", "Sample Requested");
            stage1.put("completed", !samples.isEmpty());
            stage1.put("date", samples.isEmpty() ? null : samples.get(0).getCreatedAt());
            timeline.add(stage1);

            // Stage 2: Sample Collected
            boolean collected = samples.stream().anyMatch(s ->
                    "COLLECTED".equals(s.getStatus()) || "LAB_RECEIVED".equals(s.getStatus())
                    || "COMPLETED".equals(s.getStatus()));
            Map<String, Object> stage2 = new LinkedHashMap<>();
            stage2.put("stage", "Sample Collected");
            stage2.put("completed", collected);
            stage2.put("date", samples.stream()
                    .filter(s -> s.getCollectionDate() != null)
                    .map(SoilSample::getCollectionDate)
                    .max(Comparator.naturalOrder())
                    .orElse(null));
            timeline.add(stage2);

            // Stage 3: Lab Testing
            boolean labReceived = samples.stream().anyMatch(s ->
                    "LAB_RECEIVED".equals(s.getStatus()) || "COMPLETED".equals(s.getStatus()));
            Map<String, Object> stage3 = new LinkedHashMap<>();
            stage3.put("stage", "Lab Testing");
            stage3.put("completed", labReceived);
            stage3.put("date", samples.stream()
                    .filter(s -> s.getReceivedAtLab() != null)
                    .map(SoilSample::getReceivedAtLab)
                    .max(Comparator.naturalOrder())
                    .orElse(null));
            timeline.add(stage3);

            // Stage 4: Report Generated
            Map<String, Object> stage4 = new LinkedHashMap<>();
            stage4.put("stage", "Report Generated");
            stage4.put("completed", !reports.isEmpty());
            stage4.put("date", reports.stream()
                    .map(SoilReport::getCreatedAt)
                    .filter(Objects::nonNull)
                    .max(Comparator.naturalOrder())
                    .orElse(null));
            timeline.add(stage4);

            // Stage 5: Report Delivered
            boolean delivered = reports.stream().anyMatch(SoilReport::isShareLandowner);
            Map<String, Object> stage5 = new LinkedHashMap<>();
            stage5.put("stage", "Report Delivered");
            stage5.put("completed", delivered);
            stage5.put("date", reports.stream()
                    .filter(SoilReport::isShareLandowner)
                    .map(SoilReport::getCreatedAt)
                    .filter(Objects::nonNull)
                    .max(Comparator.naturalOrder())
                    .orElse(null));
            timeline.add(stage5);

            return ApiResponse.success(timeline);
        } catch (Exception e) {
            return ApiResponse.error("Failed to load soil timeline: " + e.getMessage());
        }
    }

    // ─── GET /landowner/dashboard/finance-summary ─────────────────────────────

    /**
     * Returns financial summary: totalInvestment, totalExpenses, totalRevenue, profit.
     * Expenses are derived from FieldUpdates (expense type) and FieldOperations.
     * Revenue is derived from FieldUpdates (income type) and Farm.expectedRevenue.
     */
    @GetMapping("/finance-summary")
    public ApiResponse<Map<String, Object>> getFinanceSummary(Authentication auth) {
        try {
            User user = (User) auth.getPrincipal();
            List<Farm> farms = farmRepository.findByOwnerId(user.getId());
            List<String> farmIds = farms.stream().map(Farm::getId).collect(Collectors.toList());

            // Total investment = sum of all field operation costs
            BigDecimal totalInvestment = BigDecimal.ZERO;
            for (Farm farm : farms) {
                BigDecimal cost = fieldOperationRepository.sumCostByFarmId(farm.getId());
                if (cost != null) totalInvestment = totalInvestment.add(cost);
            }

            // Expenses from FieldUpdates
            BigDecimal totalExpenses = BigDecimal.ZERO;
            BigDecimal totalRevenue = BigDecimal.ZERO;

            if (!farmIds.isEmpty()) {
                List<FieldUpdate> updates = fieldUpdateRepository.findByFarmIdIn(farmIds);
                for (FieldUpdate update : updates) {
                    if (update.getAmount() == null) continue;
                    if ("expense".equalsIgnoreCase(update.getTransactionType())
                            || "expense".equalsIgnoreCase(update.getUpdateType())) {
                        totalExpenses = totalExpenses.add(update.getAmount());
                    } else if ("income".equalsIgnoreCase(update.getTransactionType())
                            || "income".equalsIgnoreCase(update.getUpdateType())) {
                        totalRevenue = totalRevenue.add(update.getAmount());
                    }
                }
            }

            // Add field operation costs to expenses if no FieldUpdate expenses recorded
            if (totalExpenses.compareTo(BigDecimal.ZERO) == 0) {
                totalExpenses = totalInvestment;
            }

            // Fallback revenue from Farm.expectedRevenue
            if (totalRevenue.compareTo(BigDecimal.ZERO) == 0) {
                for (Farm farm : farms) {
                    if (farm.getExpectedRevenue() != null) {
                        totalRevenue = totalRevenue.add(farm.getExpectedRevenue());
                    }
                }
            }

            BigDecimal profit = totalRevenue.subtract(totalExpenses);

            Map<String, Object> summary = new LinkedHashMap<>();
            summary.put("totalInvestment", totalInvestment);
            summary.put("totalExpenses", totalExpenses);
            summary.put("totalRevenue", totalRevenue);
            summary.put("profit", profit);
            summary.put("farmCount", farms.size());

            return ApiResponse.success(summary);
        } catch (Exception e) {
            return ApiResponse.error("Failed to load finance summary: " + e.getMessage());
        }
    }

    // ─── GET /landowner/dashboard/field-updates ───────────────────────────────

    /**
     * Returns all field updates for the landowner's farms, sorted newest first.
     */
    @GetMapping("/field-updates")
    public ApiResponse<List<FieldUpdate>> getFieldUpdates(Authentication auth) {
        try {
            User user = (User) auth.getPrincipal();
            List<String> farmIds = getFarmIds(user.getId());
            if (farmIds.isEmpty()) return ApiResponse.success(List.of());

            List<FieldUpdate> updates = fieldUpdateRepository.findByFarmIdIn(farmIds);
            updates.sort(Comparator.comparing(FieldUpdate::getCreatedAt,
                    Comparator.nullsLast(Comparator.reverseOrder())));
            return ApiResponse.success(updates);
        } catch (Exception e) {
            return ApiResponse.error("Failed to load field updates: " + e.getMessage());
        }
    }

    // ─── GET /landowner/dashboard/schedule ────────────────────────────────────

    /**
     * Returns all schedule items for the landowner's farms, sorted by scheduled date ascending.
     */
    @GetMapping("/schedule")
    public ApiResponse<List<ScheduleItem>> getSchedule(Authentication auth) {
        try {
            User user = (User) auth.getPrincipal();
            List<String> farmIds = getFarmIds(user.getId());
            if (farmIds.isEmpty()) return ApiResponse.success(List.of());

            List<ScheduleItem> items = scheduleItemRepository.findByFarmIdIn(farmIds);
            items.sort(Comparator.comparing(ScheduleItem::getScheduledDate,
                    Comparator.nullsLast(Comparator.naturalOrder())));
            return ApiResponse.success(items);
        } catch (Exception e) {
            return ApiResponse.error("Failed to load schedule: " + e.getMessage());
        }
    }
}
