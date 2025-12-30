package com.synapse.dto;

import com.synapse.entity.Comment;
import java.time.LocalDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommentDto {

    private Long id;
    private String content;
    private UserDto user;
    private Long postId;
    private Long parentId;
    private List<CommentDto> replies;
    private Integer replyCount;
    private LocalDateTime createdAt;
    private Boolean isDeleted;

    public static CommentDto fromEntity(Comment comment) {
        return CommentDto.builder()
                .id(comment.getId())
                .content(comment.getIsDeleted() ? "[已删除]" : comment.getContent())
                .user(UserDto.fromEntity(comment.getUser()))
                .postId(comment.getPost() != null ? comment.getPost().getId() : null)
                .parentId(comment.getParent() != null ? comment.getParent().getId() : null)
                .createdAt(comment.getCreatedAt())
                .isDeleted(comment.getIsDeleted())
                .build();
    }

    public static CommentDto fromEntityWithReplies(Comment comment) {
        CommentDto dto = fromEntity(comment);
        if (comment.getReplies() != null && !comment.getReplies().isEmpty()) {
            dto.setReplies(comment.getReplies().stream()
                    .map(CommentDto::fromEntity)
                    .toList());
            dto.setReplyCount(comment.getReplies().size());
        }
        return dto;
    }
}
