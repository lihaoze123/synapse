package com.synapse.controller;

import com.synapse.dto.ApiResponse;
import com.synapse.dto.CommentDto;
import com.synapse.dto.CreateCommentRequest;
import com.synapse.dto.UpdateCommentRequest;
import com.synapse.service.CommentService;
import com.synapse.service.CommentLikeService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class CommentController {

	private static final int MAX_PAGE_SIZE = 100;
	private static final int DEFAULT_PAGE_SIZE = 20;

	private final CommentService commentService;
	private final CommentLikeService commentLikeService;

	@GetMapping("/posts/{postId}/comments")
	public ResponseEntity<ApiResponse<Page<CommentDto>>> getPostComments(
			@PathVariable Long postId,
			@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "20") int size,
			HttpServletRequest request) {
		int safeSize = Math.min(Math.max(size, 1), MAX_PAGE_SIZE);
		Pageable pageable = PageRequest.of(page, safeSize);
		try {
			Long userId = (Long) request.getAttribute("userId");
			Page<CommentDto> comments = commentService
					.getPostComments(postId, pageable)
					.map(dto -> {
						if (userId != null && dto.getUserState() != null) {
							boolean liked = commentLikeService.hasLikedComment(
									userId,
									dto.getId());
							dto.getUserState().setLiked(liked);
						}
						return dto;
					});
			return ResponseEntity.ok(ApiResponse.success(comments));
		} catch (IllegalArgumentException e) {
			return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
		}
	}

	@GetMapping("/comments/{id}")
	public ResponseEntity<ApiResponse<CommentDto>> getComment(HttpServletRequest request, @PathVariable Long id) {
		try {
			CommentDto comment = commentService.getComment(id);
			Long userId = (Long) request.getAttribute("userId");
			if (userId != null && comment.getUserState() != null) {
				comment.getUserState()
						.setLiked(
								commentLikeService.hasLikedComment(
										userId,
										comment.getId()));
			}
			return ResponseEntity.ok(ApiResponse.success(comment));
		} catch (IllegalArgumentException e) {
			return ResponseEntity.status(404).body(ApiResponse.error(e.getMessage()));
		}
	}

	@PostMapping("/posts/{postId}/comments")
	public ResponseEntity<ApiResponse<CommentDto>> createComment(
			HttpServletRequest request,
			@PathVariable Long postId,
			@Valid @RequestBody CreateCommentRequest createRequest) {
		Long userId = (Long) request.getAttribute("userId");
		if (userId == null) {
			return ResponseEntity.status(401).body(ApiResponse.error("Not authenticated"));
		}
		try {
			CommentDto comment = commentService.createComment(userId, postId, createRequest);
			return ResponseEntity.ok(ApiResponse.success("Comment created successfully", comment));
		} catch (IllegalArgumentException e) {
			return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
		}
	}

	@PutMapping("/comments/{id}")
	public ResponseEntity<ApiResponse<CommentDto>> updateComment(
			HttpServletRequest request,
			@PathVariable Long id,
			@Valid @RequestBody UpdateCommentRequest updateRequest) {
		Long userId = (Long) request.getAttribute("userId");
		if (userId == null) {
			return ResponseEntity.status(401).body(ApiResponse.error("Not authenticated"));
		}
		try {
			CommentDto comment = commentService.updateComment(id, userId, updateRequest);
			return ResponseEntity.ok(ApiResponse.success("Comment updated successfully", comment));
		} catch (IllegalArgumentException e) {
			return ResponseEntity.status(403).body(ApiResponse.error(e.getMessage()));
		}
	}

	@DeleteMapping("/comments/{id}")
	public ResponseEntity<ApiResponse<Void>> deleteComment(
			HttpServletRequest request,
			@PathVariable Long id) {
		Long userId = (Long) request.getAttribute("userId");
		if (userId == null) {
			return ResponseEntity.status(401).body(ApiResponse.error("Not authenticated"));
		}
		try {
			commentService.deleteComment(id, userId);
			return ResponseEntity.ok(ApiResponse.success("Comment deleted successfully", null));
		} catch (IllegalArgumentException e) {
			return ResponseEntity.status(403).body(ApiResponse.error(e.getMessage()));
		}
	}
}
