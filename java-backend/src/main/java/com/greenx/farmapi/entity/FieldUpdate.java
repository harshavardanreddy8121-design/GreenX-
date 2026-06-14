package com.greenx.farmapi.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "GX_FIELD_UPDATES")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FieldUpdate {

    @Id
    @Column(name = "ID", length = 36)
    private String id;

    @Column(name = "FARM_ID", length = 36, nullable = false)
    private String farmId;

    @Column(name = "FIELD_MANAGER_ID", length = 36, nullable = false)
    private String fieldManagerId;

    @Column(name = "UPDATE_TYPE", length = 50, nullable = false)
    private String updateType; // photo, note, expense, income

    @Column(name = "TITLE", length = 255)
    private String title;

    @Lob
    @Column(name = "DESCRIPTION")
    private String description;

    @Column(name = "PHOTO_URL", length = 500)
    private String photoUrl;

    @Column(name = "AMOUNT", precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(name = "TRANSACTION_TYPE", length = 50)
    private String transactionType; // expense, income

    @Column(name = "RELATED_SCHEDULE_ITEM_ID", length = 36)
    private String relatedScheduleItemId;

    @Column(name = "CREATED_AT")
    private LocalDateTime createdAt;

    @Column(name = "UPDATED_AT")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (id == null)
            id = UUID.randomUUID().toString();
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
