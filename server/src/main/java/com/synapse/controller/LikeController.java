package com.synapse.controller;

import com.synapse.dto.ApiResponse;
import com.synapse.service.LikeService;
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
@RequestMapping("/api/likes")
@RequiredArgsConstructor
@Tag(name = "Likes", description = "Post like/unlike functionality")
public class LikeController {

    private final LikeService likeService;

    @PostMapping("/posts/{postId}")
    @Operation(summary = "Toggle post like", description = "Likes or unlikes a post")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Like toggled successfully"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Not authenticated"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid request")
    })
    public ResponseEntity<ApiResponse<Map<String, Object>>> togglePostLike(
            HttpServletRequest request,
            @Parameter(description = "Post ID", required = true) @PathVariable Long postId
    ) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Not authenticated"));
        }

        try {
            LikeService.ToggleResult result = likeService.togglePostLike(userId, postId);
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
