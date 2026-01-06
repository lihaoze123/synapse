package com.synapse.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "User registration request")
public class RegisterRequest {

    @Schema(description = "Username (3-20 characters)", example = "johndoe", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 20, message = "Username must be between 3 and 20 characters")
    private String username;

    @Schema(description = "Email", example = "johndoe@example.com", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @Schema(description = "Password (min 6 characters)", example = "password123", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    @Schema(description = "Avatar URL", example = "https://example.com/avatar.png")
    private String avatarUrl;

    // Backward-compatible constructor used by older tests:
    // (username, password, avatarUrl). Email should be provided via the API path;
    // tests bypass validation so this is safe.
    public RegisterRequest(String username, String password, String avatarUrl) {
        this.username = username;
        this.password = password;
        this.avatarUrl = avatarUrl;
    }
}
