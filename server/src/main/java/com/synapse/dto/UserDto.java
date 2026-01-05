package com.synapse.dto;

import com.synapse.entity.User;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "User profile information")
public class UserDto {

    @Schema(description = "User ID", example = "1")
    private Long id;

    @Schema(description = "Username", example = "johndoe")
    private String username;

    @Schema(description = "Avatar URL", example = "https://example.com/avatar.png")
    private String avatarUrl;

    @Schema(description = "Display name", example = "John Doe")
    private String displayName;

    @Schema(description = "User biography", example = "Software developer")
    private String bio;

    public static UserDto fromEntity(User user) {
        return UserDto.builder()
            .id(user.getId())
            .username(user.getUsername())
            .avatarUrl(user.getAvatarUrl())
            .displayName(user.getDisplayName())
            .bio(user.getBio())
            .build();
    }
}
