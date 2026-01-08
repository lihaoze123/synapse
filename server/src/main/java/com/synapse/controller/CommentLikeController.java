package com.synapse.controller;

import com.synapse.dto.ApiResponse;
import com.synapse.service.CommentLikeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/comment-likes")
@RequiredArgsConstructor
@Tag(name = "Comment Likes", description = "Comment like/unlike functionality")
public class CommentLikeController {

    private final CommentLikeService commentLikeService;

    @PostMapping("/{commentId}")
    @Operation(summary = "Toggle comment like", description = "Likes or unlikes a comment")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200",
            description = "Like toggled successfully"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "401",
            description = "Not authenticated"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "400",
            description = "Invalid request")
    })
    public ResponseEntity<ApiResponse<Map<String, Object>>> toggleCommentLike(
            HttpServletRequest request,
            @Parameter(description = "Comment ID", required = true)
            @PathVariable Long commentId) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Not authenticated"));
        }

        try {
            CommentLikeService.ToggleResult result = commentLikeService.toggleCommentLike(userId, commentId);
            Map<String, Object> data = new HashMap<>();
            data.put("liked", result.liked());
            data.put("count", result.count());
            String message = result.liked() ? "liked" : "unliked";
            return ResponseEntity.ok(ApiResponse.success(message, data));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}
