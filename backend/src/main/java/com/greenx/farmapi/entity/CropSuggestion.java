package com.greenx.farmapi.entity;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "GX_CROP_SUGGESTIONS")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CropSuggestion {

    @Id
    @Column(name = "ID", length = 36)
    private String id;

    @Column(name = "REPORT_ID", length = 36)
    private String reportId;

    @Column(name = "FARM_ID", length = 36, nullable = false)
    private String farmId;

    @Column(name = "EXPERT_ID", length = 36, nullable = false)
    private String expertId;

    @Column(name = "CROP_NAME", length = 100, nullable = false)
    private String cropName;

    @Column(name = "CROP_VARIETY", length = 100)
    private String cropVariety;

    @Column(name = "SEASON", length = 50)
    private String season;

    @Column(name = "EXPECTED_YIELD_MIN", precision = 8, scale = 2)
    private BigDecimal expectedYieldMin;

    @Column(name = "EXPECTED_YIELD_MAX", precision = 8, scale = 2)
    private BigDecimal expectedYieldMax;

    @Column(name = "YIELD_UNIT", length = 20)
    @Builder.Default
    private String yieldUnit = "T/ACRE";

    @Column(name = "PROFIT_PER_ACRE", precision = 10, scale = 2)
    private BigDecimal profitPerAcre;

    @Column(name = "INPUT_COST_ESTIMATE", precision = 10, scale = 2)
    private BigDecimal inputCostEstimate;

    @Column(name = "DURATION_DAYS")
    private Integer durationDays;

    @Column(name = "SUITABILITY_SCORE", precision = 3, scale = 1)
    private BigDecimal suitabilityScore;

    @Lob
    @Column(name = "EXPERT_NOTES")
    private String expertNotes;

    @Column(name = "IS_SELECTED")
    @Builder.Default
    @JsonProperty("isselected")
    private boolean isSelected = false;

    @Column(name = "SELECTED_AT")
    private LocalDateTime selectedAt;

    @Column(name = "CREATED_AT")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (id == null)
            id = UUID.randomUUID().toString();
        createdAt = LocalDateTime.now();
    }
}
