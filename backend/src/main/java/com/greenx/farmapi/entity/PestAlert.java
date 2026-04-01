package com.greenx.farmapi.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "GX_PEST_ALERTS")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PestAlert {

    @Id
    @Column(name = "ID", length = 36)
    private String id;

    @Column(name = "FARM_ID", length = 36, nullable = false)
    private String farmId;

    @Column(name = "REPORTED_BY", length = 36, nullable = false)
    private String reportedBy;

    @Column(name = "PEST_NAME", length = 200, nullable = false)
    private String pestName;

    @Column(name = "PEST_TYPE", length = 50)
    private String pestType;

    @Column(name = "SEVERITY", length = 20, nullable = false)
    private String severity;

    @Column(name = "AFFECTED_AREA_PCT", precision = 5, scale = 2)
    private BigDecimal affectedAreaPct;

    @Column(name = "FIELD_LOCATION", length = 200)
    private String fieldLocation;

    @Lob
    @Column(name = "DESCRIPTION")
    private String description;

    @Column(name = "STATUS", length = 30)
    @Builder.Default
    private String status = "OPEN";

    @Column(name = "PHOTOS")
    private String photos; // comma-separated file paths

    @Column(name = "RESOLVED_AT")
    private LocalDateTime resolvedAt;

    @Column(name = "CREATED_AT")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (id == null)
            id = UUID.randomUUID().toString();
        if (status == null)
            status = "OPEN";
        createdAt = LocalDateTime.now();
    }
}
