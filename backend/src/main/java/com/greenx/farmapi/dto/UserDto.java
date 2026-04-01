package com.greenx.farmapi.dto;

import lombok.*;
import com.greenx.farmapi.model.User;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDto {
    private String id;
    private String uid;
    private String email;
    private String name;
    private String full_name;
    private String phone;
    private String role;
    private String clusterId;
    private Boolean isActive;

    public static UserDto fromEntity(User user) {
        return UserDto.builder()
                .id(user.getId())
                .uid(user.getUid())
                .email(user.getEmail())
                .name(user.getName())
                .full_name(user.getName())
                .phone(user.getPhone())
                .role(user.getRole())
                .clusterId(user.getClusterId())
                .isActive(user.getIsActive())
                .build();
    }
}
