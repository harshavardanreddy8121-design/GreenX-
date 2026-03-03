package com.greenx.farmapi.dto;

import lombok.*;
import com.greenx.farmapi.model.User;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDto {
    private String id;
    private String email;
    private String name;
    private String role;
    
    public static UserDto fromEntity(User user) {
        return UserDto.builder()
            .id(user.getId())
            .email(user.getEmail())
            .name(user.getName())
            .role(user.getRole())
            .build();
    }
}
