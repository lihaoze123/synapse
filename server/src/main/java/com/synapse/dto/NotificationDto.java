package com.synapse.dto;

import com.synapse.entity.Notification;
import com.synapse.entity.NotificationType;
import com.synapse.entity.PostType;
import io.swagger.v3.oas.annotations.media.Schema;
import java.time.Instant;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "User notification data")
public class NotificationDto {

    @Schema(description = "Notification ID", example = "1")
    private Long id;

    @Schema(description = "Notification type", example = "LIKE")
    private NotificationType type;

    @Schema(description = "User who triggered the notification")
    private ActorDto actor;

    @Schema(description = "Related post summary")
    private PostSummaryDto post;

    @Schema(description = "Related comment ID")
    private Long commentId;

    @Schema(description = "Whether notification is read", example = "false")
    private Boolean isRead;

    @Schema(description = "Creation timestamp", example = "2024-01-01T00:00:00Z")
    private Instant createdAt;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @Schema(description = "Notification actor (user who performed action)")
    public static class ActorDto {
        @Schema(description = "User ID", example = "2")
        private Long id;

        @Schema(description = "Username", example = "janedoe")
        private String username;

        @Schema(description = "Avatar URL")
        private String avatarUrl;

        @Schema(description = "Display name")
        private String displayName;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @Schema(description = "Post summary in notification")
    public static class PostSummaryDto {
        @Schema(description = "Post ID", example = "10")
        private Long id;

        @Schema(description = "Post title", example = "My Post")
        private String title;

        @Schema(description = "Post type", example = "ARTICLE")
        private PostType type;
    }

    public static NotificationDto fromEntity(Notification notification) {
        NotificationDtoBuilder builder = NotificationDto.builder()
                .id(notification.getId())
                .type(notification.getType())
                .actor(ActorDto.builder()
                        .id(notification.getActor().getId())
                        .username(notification.getActor().getUsername())
                        .avatarUrl(notification.getActor().getAvatarUrl())
                        .displayName(notification.getActor().getDisplayName())
                        .build())
                .isRead(notification.getIsRead())
                .createdAt(notification.getCreatedAt());

        if (notification.getPost() != null) {
            builder.post(PostSummaryDto.builder()
                    .id(notification.getPost().getId())
                    .title(notification.getPost().getTitle())
                    .type(notification.getPost().getType())
                    .build());
        }

        if (notification.getComment() != null) {
            builder.commentId(notification.getComment().getId());
        }

        return builder.build();
    }
}
