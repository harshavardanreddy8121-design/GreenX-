package com.greenx.farmapi.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "GX_SITE_VISIT_REPORTS")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SiteVisitReport {

    @Id
    @Column(name = "ID", length = 36)
    private String id;

    @Column(name = "FARM_ID", length = 36, nullable = false)
    private String farmId;

    @Column(name = "FIELD_MANAGER_ID", length = 36, nullable = false)
    private String fieldManagerId;

    @Column(name = "VISIT_DATE", nullable = false)
    private LocalDate visitDate;

    @Lob
    @Column(name = "OBSERVATIONS")
    private String observations;

    @Column(name = "SOIL_SAMPLE_COLLECTED")
    @Builder.Default
    private boolean soilSampleCollected = true;

    @Column(name = "PHOTO_URL", length = 500)
    private String photoUrl;

    @Lob
    @Column(name = "NOTES")
    private String notes;

    @Column(name = "CREATED_AT")
    private LocalDateTime createdAt;

    @Column(name = "UPDATED_AT")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (id == null)
            id = UUID.randomUUID().toString();
        if (visitDate == null)
            visitDate = LocalDate.now();
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
