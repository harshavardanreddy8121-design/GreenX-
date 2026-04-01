package com.greenx.farmapi.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "GX_NOTIFICATIONS")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    @Column(name = "ID", length = 36)
    private String id;

    @Column(name = "TO_USER_ID", length = 36, nullable = false)
    private String toUserId;

    @Column(name = "FROM_USER_ID", length = 36)
    private String fromUserId;

    @Column(name = "FROM_ROLE", length = 30)
    private String fromRole;

    @Column(name = "TITLE", length = 200, nullable = false)
    private String title;

    @Lob
    @Column(name = "MESSAGE", nullable = false)
    private String message;

    @Column(name = "TYPE", length = 30)
    @Builder.Default
    private String type = "INFO";

    @Column(name = "RELATED_FARM_ID", length = 36)
    private String relatedFarmId;

    @Column(name = "RELATED_ENTITY_TYPE", length = 50)
    private String relatedEntityType;

    @Column(name = "RELATED_ENTITY_ID", length = 36)
    private String relatedEntityId;

    @Column(name = "IS_READ")
    @Builder.Default
    private boolean isRead = false;

    @Column(name = "READ_AT")
    private LocalDateTime readAt;

    @Column(name = "CREATED_AT")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (id == null)
            id = UUID.randomUUID().toString();
        if (type == null)
            type = "INFO";
        createdAt = LocalDateTime.now();
    }
}
