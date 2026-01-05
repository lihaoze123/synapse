package com.synapse.dto;

import com.synapse.entity.Comment;
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
@Schema(description = "Comment data with user and like state")
public class CommentDto {

    @Schema(description = "Comment ID", example = "1")
    private Long id;

    @Schema(description = "Comment content", example = "Great post!")
    private String content;

    @Schema(description = "Comment author")
    private UserDto user;

    @Schema(description = "Post ID", example = "10")
    private Long postId;

    @Schema(description = "Parent comment ID (for replies)")
    private Long parentId;

    @Schema(description = "Floor number (comment position)")
    private Integer floor;

    @Schema(description = "Reply-to floor number")
    private Integer replyToFloor;

    @Schema(description = "Reply-to username")
    private String replyToUsername;

    @Schema(description = "Creation timestamp", example = "2024-01-01T00:00:00Z")
    private Instant createdAt;

    @Schema(description = "Whether comment is deleted", example = "false")
    private Boolean isDeleted;

    @Schema(description = "Number of likes", example = "5")
    private int likeCount;

    @Schema(description = "Current user's state (liked)")
    private UserStateDto userState;

    public static CommentDto fromEntity(Comment comment) {
        CommentDto dto = CommentDto.builder()
                .id(comment.getId())
                .content(comment.getIsDeleted() ? "[已删除]" : comment.getContent())
                .user(UserDto.fromEntity(comment.getUser()))
                .postId(comment.getPost() != null ? comment.getPost().getId() : null)
                .parentId(comment.getParent() != null ? comment.getParent().getId() : null)
                .floor(comment.getFloor())
                .createdAt(comment.getCreatedAt())
                .isDeleted(comment.getIsDeleted())
                .likeCount(comment.getLikeCount())
                .userState(new UserStateDto(false))
                .build();

        if (comment.getParent() != null) {
            dto.setReplyToFloor(comment.getParent().getFloor());
            dto.setReplyToUsername(comment.getParent().getUser().getUsername());
        }

        return dto;
    }
}
