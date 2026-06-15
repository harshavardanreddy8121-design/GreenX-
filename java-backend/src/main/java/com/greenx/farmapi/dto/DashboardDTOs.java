package com.greenx.farmapi.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * DTOs for the Landowner Dashboard API endpoints.
 */
public class DashboardDTOs {

    // ─── MODULE 1: OVERVIEW ──────────────────────────────────────────────────

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DashboardOverviewDTO {
        private double totalLandArea;
        private double totalInputCosts;
        private long totalSoilSamples;
        private int farmsCount;
        private String activeStatus;
        private LocalDateTime lastUpdate;
    }

    // ─── MODULE 2: SOIL SAMPLES ──────────────────────────────────────────────

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SoilSampleItemDTO {
        private String id;
        private String sampleCode;
        private Object collectionDate;
        private String status;
        private String collectedBy;
        private String reportId;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SoilSamplesDTO {
        private int totalSamples;
        private List<SoilSampleItemDTO> samples;
    }

    // ─── MODULE 3: SOIL REPORTS ──────────────────────────────────────────────

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SoilReportDTO {
        private String id;
        private Object submittedDate;
        private String expertName;
        private Double ph;
        private Double nitrogen;
        private Double phosphorus;
        private Double potassium;
        private Double organicMatter;
        private Double moisture;
        private Double ecDsM;
        private Double zincPpm;
        private Double boronPpm;
        private Double sulphurPpm;
        private Double ironPpm;
        private String notes;
        private String overallRating;
        private String status;
        private String farmId;
    }

    // ─── MODULE 4: CROP SUGGESTIONS ──────────────────────────────────────────

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CropSuggestionDTO {
        private String id;
        private String cropName;
        private String variety;
        private Double expectedYieldMin;
        private Double expectedYieldMax;
        private String yieldUnit;
        private Double profitPerAcre;
        private Double inputCostEstimate;
        private Integer durationDays;
        private Double suitabilityScore;
        private String reasoning;
        private String expertName;
        private Object submittedDate;
        private boolean selected;
        private String season;
        private String farmId;
    }

    // ─── MODULE 5: SOIL SAMPLE TIMELINE ──────────────────────────────────────

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TimelineStageDTO {
        private String stage;
        private String status;
        private Object date;
        private String description;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SoilSampleTimelineDTO {
        private List<TimelineStageDTO> timeline;
        private String currentStage;
    }

    // ─── MODULE 6: FINANCE SUMMARY ───────────────────────────────────────────

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class FinanceSummaryDTO {
        private double totalInvestment;
        private Map<String, Double> expenses;
        private double revenue;
        private double profitLoss;
        private double profitMargin;
        private double budgetUsed;
        private double budgetLimit;
        private LocalDateTime lastUpdated;
    }
}
