package com.greenx.farmapi.entity;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "GX_PRESCRIPTIONS")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Prescription {

    @Id
    @Column(name = "ID", length = 36)
    private String id;

    @Column(name = "ALERT_ID", length = 36, nullable = false)
    private String alertId;

    @Column(name = "EXPERT_ID", length = 36, nullable = false)
    private String expertId;

    @Column(name = "CHEMICAL_NAME", length = 200, nullable = false)
    private String chemicalName;

    @Column(name = "CHEMICAL_TYPE", length = 50)
    private String chemicalType;

    @Column(name = "DOSE", length = 200, nullable = false)
    private String dose;

    @Column(name = "DILUTION_RATIO", length = 100)
    private String dilutionRatio;

    @Column(name = "APPLICATION_METHOD", length = 100, nullable = false)
    private String applicationMethod;

    @Column(name = "APPLICATION_TIMING", length = 200)
    private String applicationTiming;

    @Column(name = "PRE_HARVEST_INTERVAL", length = 100)
    private String preHarvestInterval;

    @Lob
    @Column(name = "SAFETY_PRECAUTIONS")
    private String safetyPrecautions;

    @Lob
    @Column(name = "FM_INSTRUCTIONS")
    private String fmInstructions;

    @Column(name = "IS_ACKNOWLEDGED")
    @Builder.Default
    @JsonProperty("isacknowledged")
    private boolean isAcknowledged = false;

    @Column(name = "ACKNOWLEDGED_AT")
    private LocalDateTime acknowledgedAt;

    @Column(name = "CREATED_AT")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (id == null)
            id = UUID.randomUUID().toString();
        createdAt = LocalDateTime.now();
    }
}
