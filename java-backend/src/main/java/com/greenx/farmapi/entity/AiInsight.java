package com.greenx.farmapi.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Stores autonomously generated AI insights and recommendations.
 * These are proactive insights generated without user prompting.
 */
@Entity
@Table(name = "AI_INSIGHTS")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiInsight {

    @Id
    @Column(name = "ID", length = 36)
    private String id;

    @Column(name = "FARM_ID", length = 36)
    private String farmId;

    @Column(name = "USER_ID", length = 36)
    private String userId;

    /** CROP_HEALTH | PEST_RISK | SOIL | WEATHER | RESOURCE | FINANCIAL | GENERAL */
    @Column(name = "CATEGORY", length = 50)
    private String category;

    /** INFO | WARNING | CRITICAL | SUCCESS */
    @Column(name = "SEVERITY", length = 20)
    @Builder.Default
    private String severity = "INFO";

    @Column(name = "TITLE", length = 255)
    private String title;

    @Column(name = "SUMMARY", length = 500)
    private String summary;

    @Column(name = "DETAILS", columnDefinition = "TEXT")
    private String details;

    /** JSON array of suggested actions */
    @Column(name = "SUGGESTED_ACTIONS", columnDefinition = "TEXT")
    private String suggestedActions;

    @Column(name = "CONFIDENCE_SCORE")
    @Builder.Default
    private Integer confidenceScore = 75;

    @Column(name = "IS_READ")
    @Builder.Default
    private Boolean isRead = false;

    @Column(name = "IS_DISMISSED")
    @Builder.Default
    private Boolean isDismissed = false;

    @Column(name = "EXPIRES_AT")
    private LocalDateTime expiresAt;

    @Column(name = "CREATED_AT")
    private LocalDateTime createdAt;

    @Column(name = "UPDATED_AT")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (id == null) id = UUID.randomUUID().toString();
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
