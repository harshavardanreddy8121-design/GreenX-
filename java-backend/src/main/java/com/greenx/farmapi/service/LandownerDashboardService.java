package com.greenx.farmapi.service;

import com.greenx.farmapi.dto.DashboardDTOs.*;
import com.greenx.farmapi.entity.*;
import com.greenx.farmapi.model.User;
import com.greenx.farmapi.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LandownerDashboardService {

    private final FarmRepository farmRepository;
    private final SoilReportRepository soilReportRepository;
    private final SoilSampleRepository soilSampleRepository;
    private final CropSuggestionRepository cropSuggestionRepository;
    private final FieldUpdateRepository fieldUpdateRepository;
    private final SiteVisitReportRepository siteVisitReportRepository;
    private final UserRepository userRepository;

    // ─── MODULE 1: OVERVIEW ──────────────────────────────────────────────────

    public DashboardOverviewDTO getOverview(String landownerId) {
        List<Farm> farms = farmRepository.findByOwnerId(landownerId);
        List<String> farmIds = farms.stream().map(Farm::getId).toList();

        double totalLand = farms.stream()
                .mapToDouble(f -> f.getTotalLand() != null ? f.getTotalLand() : 0)
                .sum();

        double totalCosts = 0;
        long totalSamples = 0;

        if (!farmIds.isEmpty()) {
            totalCosts = fieldUpdateRepository.findByFarmIdIn(farmIds).stream()
                    .filter(u -> "expense".equalsIgnoreCase(u.getTransactionType()))
                    .mapToDouble(u -> u.getAmount() != null ? u.getAmount().doubleValue() : 0)
                    .sum();

            totalSamples = soilSampleRepository.findByFarmIdIn(farmIds).size();
        }

        long activeFarms = farms.stream()
                .filter(f -> !"INACTIVE".equalsIgnoreCase(f.getStatus()))
                .count();
        String activeStatus = activeFarms > 0 ? "In Progress" : "No Active Farms";

        return DashboardOverviewDTO.builder()
                .totalLandArea(totalLand)
                .totalInputCosts(totalCosts)
                .totalSoilSamples(totalSamples)
                .farmsCount(farms.size())
                .activeStatus(activeStatus)
                .lastUpdate(LocalDateTime.now())
                .build();
    }

    // ─── MODULE 2: SOIL SAMPLES ──────────────────────────────────────────────

    public SoilSamplesDTO getSoilSamples(String farmId) {
        List<SoilSample> samples = soilSampleRepository.findByFarmId(farmId);
        samples.sort(Comparator.comparing(
                SoilSample::getCreatedAt,
                Comparator.nullsLast(Comparator.reverseOrder())));

        List<SoilSampleItemDTO> dtos = samples.stream()
                .map(s -> {
                    String collectorName = s.getCollectorName();
                    if (collectorName == null && s.getCollectedBy() != null) {
                        collectorName = userRepository.findById(s.getCollectedBy())
                                .map(User::getName)
                                .orElse(s.getCollectedBy());
                    }
                    return SoilSampleItemDTO.builder()
                            .id(s.getId())
                            .sampleCode(s.getSampleCode())
                            .collectionDate(s.getCollectionDate())
                            .status(s.getStatus())
                            .collectedBy(collectorName)
                            .build();
                })
                .toList();

        return SoilSamplesDTO.builder()
                .totalSamples(dtos.size())
                .samples(dtos)
                .build();
    }

    // ─── MODULE 3: SOIL REPORTS ──────────────────────────────────────────────

    public List<SoilReportDTO> getSoilReports(String farmId) {
        List<SoilReport> reports = soilReportRepository.findByFarmIdAndShareLandownerTrue(farmId);
        reports.sort(Comparator.comparing(
                SoilReport::getCreatedAt,
                Comparator.nullsLast(Comparator.reverseOrder())));

        return reports.stream()
                .map(r -> {
                    String expertName = userRepository.findById(r.getExpertId())
                            .map(User::getName)
                            .orElse("Expert");
                    return SoilReportDTO.builder()
                            .id(r.getId())
                            .submittedDate(r.getReportDate() != null ? r.getReportDate() : r.getCreatedAt())
                            .expertName(expertName)
                            .ph(r.getPhLevel() != null ? r.getPhLevel().doubleValue() : null)
                            .nitrogen(r.getNitrogenKgHa() != null ? r.getNitrogenKgHa().doubleValue() : null)
                            .phosphorus(r.getPhosphorusKgHa() != null ? r.getPhosphorusKgHa().doubleValue() : null)
                            .potassium(r.getPotassiumKgHa() != null ? r.getPotassiumKgHa().doubleValue() : null)
                            .organicMatter(r.getOrganicMatterPct() != null ? r.getOrganicMatterPct().doubleValue() : null)
                            .moisture(r.getMoisturePct() != null ? r.getMoisturePct().doubleValue() : null)
                            .ecDsM(r.getEcDsM() != null ? r.getEcDsM().doubleValue() : null)
                            .zincPpm(r.getZincPpm() != null ? r.getZincPpm().doubleValue() : null)
                            .boronPpm(r.getBoronPpm() != null ? r.getBoronPpm().doubleValue() : null)
                            .sulphurPpm(r.getSulphurPpm() != null ? r.getSulphurPpm().doubleValue() : null)
                            .ironPpm(r.getIronPpm() != null ? r.getIronPpm().doubleValue() : null)
                            .notes(r.getExpertRemarks())
                            .overallRating(r.getOverallRating())
                            .status("DELIVERED")
                            .farmId(r.getFarmId())
                            .build();
                })
                .toList();
    }

    // ─── MODULE 4: CROP SUGGESTIONS ──────────────────────────────────────────

    public List<CropSuggestionDTO> getCropSuggestions(String farmId) {
        List<CropSuggestion> suggestions = cropSuggestionRepository.findByFarmId(farmId);
        suggestions.sort(Comparator.comparing(
                CropSuggestion::getCreatedAt,
                Comparator.nullsLast(Comparator.reverseOrder())));

        return suggestions.stream()
                .map(c -> {
                    String expertName = userRepository.findById(c.getExpertId())
                            .map(User::getName)
                            .orElse("Expert");
                    return CropSuggestionDTO.builder()
                            .id(c.getId())
                            .cropName(c.getCropName())
                            .variety(c.getCropVariety())
                            .expectedYieldMin(c.getExpectedYieldMin() != null ? c.getExpectedYieldMin().doubleValue() : null)
                            .expectedYieldMax(c.getExpectedYieldMax() != null ? c.getExpectedYieldMax().doubleValue() : null)
                            .yieldUnit(c.getYieldUnit())
                            .profitPerAcre(c.getProfitPerAcre() != null ? c.getProfitPerAcre().doubleValue() : null)
                            .inputCostEstimate(c.getInputCostEstimate() != null ? c.getInputCostEstimate().doubleValue() : null)
                            .durationDays(c.getDurationDays())
                            .suitabilityScore(c.getSuitabilityScore() != null ? c.getSuitabilityScore().doubleValue() : null)
                            .reasoning(c.getExpertNotes())
                            .expertName(expertName)
                            .submittedDate(c.getCreatedAt())
                            .selected(c.isSelected())
                            .season(c.getSeason())
                            .farmId(c.getFarmId())
                            .build();
                })
                .toList();
    }

    // ─── MODULE 5: SOIL SAMPLE TIMELINE ──────────────────────────────────────

    public SoilSampleTimelineDTO getSoilSampleTimeline(String farmId) {
        List<TimelineStageDTO> stages = new ArrayList<>();

        // Determine timeline from actual data
        List<SiteVisitReport> siteVisits = siteVisitReportRepository.findByFarmIdOrderByVisitDateDesc(farmId);
        List<SoilSample> samples = soilSampleRepository.findByFarmId(farmId);
        samples.sort(Comparator.comparing(SoilSample::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())));
        List<SoilReport> reports = soilReportRepository.findByFarmId(farmId);
        reports.sort(Comparator.comparing(SoilReport::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())));

        SoilSample latestSample = samples.isEmpty() ? null : samples.get(0);
        SiteVisitReport latestVisit = siteVisits.isEmpty() ? null : siteVisits.get(0);
        SoilReport latestReport = reports.isEmpty() ? null : reports.get(0);

        // Stage 1: Sample Requested
        boolean sampleRequested = latestSample != null;
        stages.add(TimelineStageDTO.builder()
                .stage("Sample Requested")
                .status(sampleRequested ? "COMPLETED" : "PENDING")
                .date(latestSample != null ? latestSample.getCreatedAt() : null)
                .description("Field manager requested soil sample collection")
                .build());

        // Stage 2: Sample Collected
        boolean sampleCollected = latestVisit != null && latestVisit.isSoilSampleCollected();
        stages.add(TimelineStageDTO.builder()
                .stage("Sample Collected")
                .status(sampleCollected ? "COMPLETED" : (sampleRequested ? "IN_PROGRESS" : "PENDING"))
                .date(latestVisit != null ? latestVisit.getCreatedAt() : null)
                .description("Soil sample collected from field by field manager")
                .build());

        // Stage 3: Lab Testing
        boolean labTesting = latestSample != null && latestSample.getReceivedAtLab() != null;
        boolean labInProgress = sampleCollected && !labTesting && latestReport == null;
        stages.add(TimelineStageDTO.builder()
                .stage("Lab Testing")
                .status(labTesting || latestReport != null ? "COMPLETED" : (labInProgress ? "IN_PROGRESS" : "PENDING"))
                .date(latestSample != null ? latestSample.getReceivedAtLab() : null)
                .description("Sample sent to laboratory for soil analysis")
                .build());

        // Stage 4: Report Generated
        boolean reportGenerated = latestReport != null;
        stages.add(TimelineStageDTO.builder()
                .stage("Report Generated")
                .status(reportGenerated ? "COMPLETED" : "PENDING")
                .date(latestReport != null ? latestReport.getCreatedAt() : null)
                .description("Expert has completed the soil analysis report")
                .build());

        // Stage 5: Report Delivered
        boolean reportDelivered = latestReport != null && latestReport.isShareLandowner();
        stages.add(TimelineStageDTO.builder()
                .stage("Report Delivered")
                .status(reportDelivered ? "COMPLETED" : (reportGenerated ? "IN_PROGRESS" : "PENDING"))
                .date(reportDelivered ? latestReport.getCreatedAt() : null)
                .description("Soil report shared with land owner for review")
                .build());

        // Determine current stage label
        String currentStage = "Sample Requested";
        if (reportDelivered) currentStage = "Report Delivered";
        else if (reportGenerated) currentStage = "Report Generated";
        else if (labTesting) currentStage = "Lab Testing";
        else if (sampleCollected) currentStage = "Sample Collected";

        return SoilSampleTimelineDTO.builder()
                .timeline(stages)
                .currentStage(currentStage)
                .build();
    }

    // ─── MODULE 6: FINANCE SUMMARY ───────────────────────────────────────────

    public FinanceSummaryDTO getFinanceSummary(String farmId) {
        List<FieldUpdate> updates = fieldUpdateRepository.findByFarmId(farmId);

        double totalInvestment = updates.stream()
                .filter(u -> "expense".equalsIgnoreCase(u.getTransactionType()))
                .mapToDouble(u -> u.getAmount() != null ? u.getAmount().doubleValue() : 0)
                .sum();

        double revenue = updates.stream()
                .filter(u -> "income".equalsIgnoreCase(u.getTransactionType()))
                .mapToDouble(u -> u.getAmount() != null ? u.getAmount().doubleValue() : 0)
                .sum();

        double profitLoss = revenue - totalInvestment;
        double profitMargin = revenue > 0 ? (profitLoss / revenue) * 100 : 0;

        Map<String, Double> expenses = updates.stream()
                .filter(u -> "expense".equalsIgnoreCase(u.getTransactionType()))
                .collect(Collectors.groupingBy(
                        u -> u.getUpdateType() != null ? u.getUpdateType() : "other",
                        Collectors.summingDouble(u -> u.getAmount() != null ? u.getAmount().doubleValue() : 0)));

        // Default budget limit of 50,000 — can be made configurable later
        double budgetLimit = 50_000;

        return FinanceSummaryDTO.builder()
                .totalInvestment(totalInvestment)
                .expenses(expenses)
                .revenue(revenue)
                .profitLoss(profitLoss)
                .profitMargin(profitMargin)
                .budgetUsed(totalInvestment)
                .budgetLimit(budgetLimit)
                .lastUpdated(LocalDateTime.now())
                .build();
    }
}
