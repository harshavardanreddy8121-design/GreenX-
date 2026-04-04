package com.greenx.farmapi.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "GX_CALENDAR_TASKS")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CalendarTask {

    @Id
    @Column(name = "ID", length = 36)
    private String id;

    @Column(name = "CALENDAR_ID", length = 36, nullable = false)
    private String calendarId;

    @Column(name = "FARM_ID", length = 36)
    private String farmId;

    @Column(name = "TASK_TYPE", length = 30, nullable = false)
    private String taskType;

    @Column(name = "TASK_TITLE", length = 200, nullable = false)
    private String taskTitle;

    @Column(name = "TASK_DESCRIPTION", length = 1000)
    private String taskDescription;

    @Column(name = "SCHEDULED_DATE", nullable = false)
    private LocalDate scheduledDate;

    @Column(name = "WEEK_NUMBER")
    private Integer weekNumber;

    @Column(name = "PRODUCT_RECOMMENDED", length = 200)
    private String productRecommended;

    @Column(name = "DOSE_RECOMMENDED", length = 200)
    private String doseRecommended;

    @Column(name = "AREA_TO_COVER", length = 100)
    private String areaToCover;

    @Column(name = "ESTIMATED_COST", precision = 10, scale = 2)
    private BigDecimal estimatedCost;

    @Column(name = "STATUS", length = 20)
    @Builder.Default
    private String status = "PENDING";

    @Column(name = "PRIORITY", length = 10)
    @Builder.Default
    private String priority = "NORMAL";

    @Column(name = "STARTED_AT")
    private LocalDateTime startedAt;

    @Column(name = "COMPLETED_AT")
    private LocalDateTime completedAt;

    @Lob
    @Column(name = "COMPLETION_NOTES")
    private String completionNotes;

    @Column(name = "CREATED_AT")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (id == null)
            id = UUID.randomUUID().toString();
        if (status == null)
            status = "PENDING";
        if (priority == null)
            priority = "NORMAL";
        createdAt = LocalDateTime.now();
    }
}
