package com.greenx.farmapi.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "USERS")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    
    @Id
    @Column(name = "ID", length = 36)
    private String id;
    
    @Column(name = "EMAIL", nullable = false, unique = true, length = 255)
    private String email;
    
    @Column(name = "PASSWORD_HASH", nullable = false, length = 255)
    private String passwordHash;
    
    @Column(name = "ROLE", length = 50)
    private String role;
    
    @Column(name = "NAME", length = 255)
    private String name;
    
    @Column(name = "CREATED_AT")
    private LocalDateTime createdAt;
    
    @Column(name = "UPDATED_AT")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
