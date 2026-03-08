package com.greenx.farmapi.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "GX_SOIL_SAMPLES")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SoilSample {

    @Id
    @Column(name = "ID", length = 36)
    private String id;

    @Column(name = "SAMPLE_CODE", unique = true, length = 30)
    private String sampleCode;

    @Column(name = "FARM_ID", length = 36, nullable = false)
    private String farmId;

    @Column(name = "COLLECTED_BY", length = 36, nullable = false)
    private String collectedBy;

    @Column(name = "ASSIGNED_EXPERT_ID", length = 36)
    private String assignedExpertId;

    @Column(name = "COLLECTION_DATE")
    private LocalDate collectionDate;

    @Column(name = "NUM_POINTS")
    @Builder.Default
    private Integer numPoints = 8;

    @Column(name = "SAMPLING_METHOD", length = 50)
    private String samplingMethod;

    @Column(name = "DEPTH_CM")
    @Builder.Default
    private Integer depthCm = 15;

    @Column(name = "SOIL_TEXTURE", length = 50)
    private String soilTexture;

    @Column(name = "GPS_COORDINATES", length = 200)
    private String gpsCoordinates;

    @Lob
    @Column(name = "COLLECTION_NOTES")
    private String collectionNotes;

    @Column(name = "STATUS", length = 20)
    @Builder.Default
    private String status = "COLLECTED";

    @Column(name = "PRIORITY", length = 10)
    @Builder.Default
    private String priority = "NORMAL";

    @Column(name = "RECEIVED_AT_LAB")
    private LocalDateTime receivedAtLab;

    @Column(name = "COLLECTOR_NAME", length = 200)
    private String collectorName;

    @Column(name = "CREATED_AT")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (id == null)
            id = UUID.randomUUID().toString();
        if (sampleCode == null)
            sampleCode = "GX-S-" + java.time.LocalDate.now().toString().replace("-", "") + "-"
                    + (int) (Math.random() * 9999 + 1000);
        if (status == null)
            status = "COLLECTED";
        if (priority == null)
            priority = "NORMAL";
        if (collectionDate == null)
            collectionDate = LocalDate.now();
        createdAt = LocalDateTime.now();
    }
}
