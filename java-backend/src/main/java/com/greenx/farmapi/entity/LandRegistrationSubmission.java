package com.greenx.farmapi.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "LAND_REGISTRATION_SUBMISSIONS")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LandRegistrationSubmission {

    @Id
    @Column(name = "ID", length = 36)
    private String id;

    @Column(name = "FULL_NAME", nullable = false, length = 200)
    private String fullName;

    @Column(name = "PHONE", nullable = false, length = 20)
    private String phone;

    @Column(name = "LOCATION", nullable = false, length = 300)
    private String location;

    @Column(name = "LAND_SIZE", nullable = false, length = 50)
    private String landSize;

    @Column(name = "MESSAGE", length = 1000)
    private String message;

    @Column(name = "STATUS", length = 20)
    @Builder.Default
    private String status = "PENDING";

    @Column(name = "SUBMITTED_AT")
    private LocalDateTime submittedAt;

    @Column(name = "NOTES", length = 2000)
    private String notes;

    @Column(name = "CREATED_AT")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (id == null) id = UUID.randomUUID().toString();
        if (status == null) status = "PENDING";
        LocalDateTime now = LocalDateTime.now();
        submittedAt = now;
        createdAt = now;
    }
}
