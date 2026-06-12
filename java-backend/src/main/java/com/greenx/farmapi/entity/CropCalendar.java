package com.greenx.farmapi.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "GX_CROP_CALENDARS")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CropCalendar {

    @Id
    @Column(name = "ID", length = 36)
    private String id;

    @Column(name = "FARM_ID", length = 36, nullable = false)
    @JsonProperty("farmId")
    private String farmId;

    @Column(name = "EXPERT_ID", length = 36, nullable = false)
    @JsonProperty("expertId")
    private String expertId;

    @Column(name = "SUGGESTION_ID", length = 36)
    @JsonProperty("suggestionId")
    private String suggestionId;

    @Column(name = "CROP_NAME", length = 100, nullable = false)
    @JsonProperty("cropName")
    private String cropName;

    @Column(name = "SEASON", length = 50)
    @JsonProperty("season")
    private String season;

    @Column(name = "SOWING_DATE")
    @JsonProperty("sowingDate")
    private LocalDate sowingDate;

    @Column(name = "HARVEST_DATE")
    @JsonProperty("harvestDate")
    private LocalDate harvestDate;

    @Column(name = "TOTAL_DURATION_DAYS")
    private Integer totalDurationDays;

    @Column(name = "STATUS", length = 20)
    @Builder.Default
    private String status = "DRAFT";

    @Column(name = "PUBLISHED_AT")
    private LocalDateTime publishedAt;

    @Column(name = "CREATED_AT")
    private LocalDateTime createdAt;

    @Column(name = "UPDATED_AT")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (id == null)
            id = UUID.randomUUID().toString();
        if (status == null)
            status = "DRAFT";
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
