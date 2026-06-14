package com.greenx.farmapi.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "GX_SCHEDULE_ITEMS")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ScheduleItem {

    @Id
    @Column(name = "ID", length = 36)
    private String id;

    @Column(name = "FARM_ID", length = 36, nullable = false)
    private String farmId;

    @Column(name = "EXPERT_ID", length = 36, nullable = false)
    private String expertId;

    @Column(name = "OPERATION_NAME", length = 255, nullable = false)
    private String operationName;

    @Column(name = "SCHEDULED_DATE", nullable = false)
    private LocalDate scheduledDate;

    @Column(name = "SCHEDULED_END_DATE")
    private LocalDate scheduledEndDate;

    @Column(name = "STATUS", length = 20)
    @Builder.Default
    private String status = "PENDING";

    @Lob
    @Column(name = "DESCRIPTION")
    private String description;

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
