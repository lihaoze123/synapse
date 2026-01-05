package com.synapse.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request to update user profile")
public class UpdateProfileRequest {

    @Schema(description = "Display name (1-50 characters)", example = "John Doe")
    @Size(min = 1, max = 50, message = "Display name must be between 1 and 50 characters")
    private String displayName;

    @Schema(description = "User biography (max 500 characters)", example = "Software developer")
    @Size(max = 500, message = "Bio must not exceed 500 characters")
    private String bio;

    @Schema(description = "Avatar URL", example = "https://example.com/avatar.png")
    private String avatarUrl;
}
