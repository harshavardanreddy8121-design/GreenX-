package com.greenx.farmapi.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Stores AI conversation history, recommendations, and analysis results.
 * Tracks multi-turn chat sessions, autonomous insights, and accuracy metrics.
 */
@Entity
@Table(name = "AI_CONVERSATIONS")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiConversation {

    @Id
    @Column(name = "ID", length = 36)
    private String id;

    /** The user who initiated this conversation (nullable for autonomous insights) */
    @Column(name = "USER_ID", length = 36)
    private String userId;

    /** Farm context for this conversation */
    @Column(name = "FARM_ID", length = 36)
    private String farmId;

    /** Conversation session grouping key */
    @Column(name = "SESSION_ID", length = 36)
    private String sessionId;

    /** Role: USER | ASSISTANT | SYSTEM */
    @Column(name = "ROLE", length = 20, nullable = false)
    private String role;

    /** The message content */
    @Column(name = "CONTENT", columnDefinition = "TEXT")
    private String content;

    /** Type: CHAT | ANALYSIS | RECOMMENDATION | INSIGHT | REPORT */
    @Column(name = "TYPE", length = 30)
    @Builder.Default
    private String type = "CHAT";

    /** AI model used (gpt-4, gpt-3.5-turbo, rule-based) */
    @Column(name = "MODEL_USED", length = 50)
    @Builder.Default
    private String modelUsed = "rule-based";

    /** Confidence score 0-100 */
    @Column(name = "CONFIDENCE_SCORE")
    private Integer confidenceScore;

    /** Whether this insight was acted upon */
    @Column(name = "ACTED_UPON")
    @Builder.Default
    private Boolean actedUpon = false;

    /** Feedback rating from user (1-5) */
    @Column(name = "FEEDBACK_RATING")
    private Integer feedbackRating;

    /** JSON metadata (farm data snapshot, analysis params, etc.) */
    @Column(name = "METADATA", columnDefinition = "TEXT")
    private String metadata;

    @Column(name = "CREATED_AT")
    private LocalDateTime createdAt;

    @Column(name = "UPDATED_AT")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (id == null) id = UUID.randomUUID().toString();
        if (sessionId == null) sessionId = UUID.randomUUID().toString();
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
