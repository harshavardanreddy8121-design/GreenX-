package com.greenx.farmapi.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "GX_SOIL_REPORTS")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SoilReport {

    @Id
    @Column(name = "ID", length = 36)
    private String id;

    @Column(name = "SAMPLE_ID", length = 36)
    private String sampleId;

    @Column(name = "FARM_ID", length = 36, nullable = false)
    private String farmId;

    @Column(name = "EXPERT_ID", length = 36, nullable = false)
    private String expertId;

    @Column(name = "PH_LEVEL", precision = 4, scale = 2)
    private BigDecimal phLevel;

    @Column(name = "NITROGEN_KG_HA", precision = 6, scale = 2)
    private BigDecimal nitrogenKgHa;

    @Column(name = "PHOSPHORUS_KG_HA", precision = 6, scale = 2)
    private BigDecimal phosphorusKgHa;

    @Column(name = "POTASSIUM_KG_HA", precision = 6, scale = 2)
    private BigDecimal potassiumKgHa;

    @Column(name = "ORGANIC_MATTER_PCT", precision = 4, scale = 2)
    private BigDecimal organicMatterPct;

    @Column(name = "MOISTURE_PCT", precision = 5, scale = 2)
    private BigDecimal moisturePct;

    @Column(name = "EC_DS_M", precision = 5, scale = 2)
    private BigDecimal ecDsM;

    @Column(name = "ZINC_PPM", precision = 5, scale = 2)
    private BigDecimal zincPpm;

    @Column(name = "BORON_PPM", precision = 5, scale = 2)
    private BigDecimal boronPpm;

    @Column(name = "SULPHUR_PPM", precision = 5, scale = 2)
    private BigDecimal sulphurPpm;

    @Column(name = "IRON_PPM", precision = 5, scale = 2)
    private BigDecimal ironPpm;

    @Lob
    @Column(name = "EXPERT_REMARKS")
    private String expertRemarks;

    @Column(name = "OVERALL_RATING", length = 20)
    private String overallRating;

    @Column(name = "REPORT_DATE")
    @Builder.Default
    private LocalDate reportDate = null;

    @Column(name = "SHARE_LANDOWNER")
    @Builder.Default
    private boolean shareLandowner = true;

    @Column(name = "SHARE_CLUSTER")
    @Builder.Default
    private boolean shareCluster = true;

    @Column(name = "SHARE_FIELDMGR")
    @Builder.Default
    private boolean shareFieldmgr = true;

    @Column(name = "CREATED_AT")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (id == null)
            id = UUID.randomUUID().toString();
        if (reportDate == null)
            reportDate = LocalDate.now();
        createdAt = LocalDateTime.now();
    }
}
