package com.greenx.farmapi.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {
    @JsonProperty("token")
    private String token;

    @JsonProperty("user")
    private UserDto user;
}
