package com.synapse.dto;

import com.synapse.entity.Notification;
import com.synapse.entity.NotificationType;
import com.synapse.entity.PostType;
import java.time.Instant;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationDto {

    private Long id;
    private NotificationType type;
    private ActorDto actor;
    private PostSummaryDto post;
    private Long commentId;
    private Boolean isRead;
    private Instant createdAt;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ActorDto {
        private Long id;
        private String username;
        private String avatarUrl;
        private String displayName;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PostSummaryDto {
        private Long id;
        private String title;
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
