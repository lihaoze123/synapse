package com.synapse.dto;

import com.synapse.entity.Comment;
import java.time.LocalDateTime;
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
	private Integer floor;
	private Integer replyToFloor;
	private String replyToUsername;
	private LocalDateTime createdAt;
	private Boolean isDeleted;

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
				.build();

		if (comment.getParent() != null) {
			dto.setReplyToFloor(comment.getParent().getFloor());
			dto.setReplyToUsername(comment.getParent().getUser().getUsername());
		}

		return dto;
	}
}
