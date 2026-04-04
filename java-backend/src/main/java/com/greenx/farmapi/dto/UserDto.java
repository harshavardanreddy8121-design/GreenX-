package com.greenx.farmapi.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;
import com.greenx.farmapi.model.User;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDto {
    @JsonProperty("id")
    private String id;

    @JsonProperty("uid")
    private String uid;

    @JsonProperty("email")
    private String email;

    @JsonProperty("name")
    private String name;

    @JsonProperty("full_name")
    private String full_name;

    @JsonProperty("phone")
    private String phone;

    @JsonProperty("role")
    private String role;

    @JsonProperty("clusterId")
    private String clusterId;

    @JsonProperty("isActive")
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
