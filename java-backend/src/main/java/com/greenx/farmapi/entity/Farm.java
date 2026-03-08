package com.greenx.farmapi.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "FARMS")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Farm {

    @Id
    @Column(name = "ID", length = 36)
    private String id;

    @Column(name = "FARM_CODE", unique = true, length = 30)
    private String farmCode;

    @Column(name = "OWNER_ID", length = 36)
    private String ownerId;

    @Column(name = "FIELD_MANAGER_ID", length = 36)
    private String fieldManagerId;

    @Column(name = "EXPERT_ID", length = 36)
    private String expertId;

    @Column(name = "CLUSTER_ID", length = 36)
    private String clusterId;

    @Column(name = "NAME", length = 200)
    private String name;

    @Column(name = "TOTAL_LAND")
    private Double totalLand;

    @Column(name = "VILLAGE", length = 100)
    private String village;

    @Column(name = "DISTRICT", length = 100)
    private String district;

    @Column(name = "STATE", length = 100)
    private String state;

    @Column(name = "PINCODE", length = 10)
    private String pincode;

    @Column(name = "SOIL_TYPE", length = 50)
    private String soilType;

    @Column(name = "WATER_SOURCE", length = 50)
    private String waterSource;

    @JsonProperty("crop")
    @Column(name = "CROP", length = 100)
    private String currentCrop;

    @JsonProperty("growth_stage")
    @Column(name = "GROWTH_STAGE", length = 50)
    private String currentStage;

    @Column(name = "STATUS", length = 20)
    @Builder.Default
    private String status = "PENDING";

    @Column(name = "CROP_HEALTH_SCORE")
    private Integer cropHealthScore;

    @Column(name = "EXPECTED_REVENUE", precision = 12, scale = 2)
    private BigDecimal expectedRevenue;

    @Column(name = "PROFIT_SHARE")
    @Builder.Default
    private Double profitShare = 70.0;

    @Column(name = "CONTRACT_SUMMARY", length = 1000)
    private String contractSummary;

    @Column(name = "LOCATION_LAT")
    private Double locationLat;

    @Column(name = "LOCATION_LNG")
    private Double locationLng;

    @Column(name = "CREATED_BY", length = 36)
    private String createdBy;

    @Column(name = "CREATED_AT")
    private LocalDateTime createdAt;

    @Column(name = "UPDATED_AT")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (id == null)
            id = UUID.randomUUID().toString();
        if (farmCode == null)
            farmCode = String.valueOf(System.currentTimeMillis() % 10_000_000_000L);
        if (status == null)
            status = "PENDING";
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
