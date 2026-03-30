package com.greenx.farmapi.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "GX_FIELD_OPERATIONS")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FieldOperation {

    @Id
    @Column(name = "ID", length = 36)
    private String id;

    @Column(name = "FARM_ID", length = 36, nullable = false)
    private String farmId;

    @Column(name = "FIELD_MANAGER_ID", length = 36, nullable = false)
    private String fieldManagerId;

    @Column(name = "TASK_ID", length = 36)
    private String taskId;

    @Column(name = "OPERATION_TYPE", length = 50, nullable = false)
    private String operationType;

    @Column(name = "OPERATION_DATE", nullable = false)
    private LocalDateTime operationDate;

    @Column(name = "PRODUCT_USED", length = 200)
    private String productUsed;

    @Column(name = "QUANTITY_USED", length = 100)
    private String quantityUsed;

    @Column(name = "UNIT", length = 30)
    private String unit;

    @Column(name = "AREA_COVERED_ACRES", precision = 6, scale = 2)
    private BigDecimal areaCoveredAcres;

    @Column(name = "WORKERS_DEPLOYED")
    private Integer workersDeployed;

    @Column(name = "COST_INCURRED", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal costIncurred = BigDecimal.ZERO;

    @Column(name = "WEATHER_CONDITION", length = 50)
    private String weatherCondition;

    @Column(name = "TEMPERATURE_C", precision = 4, scale = 1)
    private BigDecimal temperatureC;

    @Lob
    @Column(name = "OBSERVATIONS")
    private String observations;

    @Column(name = "PHOTOS")
    private String photos; // comma-separated file paths

    @Column(name = "CREATED_AT")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (id == null)
            id = UUID.randomUUID().toString();
        if (operationDate == null)
            operationDate = LocalDateTime.now();
        if (costIncurred == null)
            costIncurred = BigDecimal.ZERO;
        createdAt = LocalDateTime.now();
    }
}
