package com.synapse.controller;

import com.synapse.dto.ApiResponse;
import com.synapse.dto.CreatePostRequest;
import com.synapse.dto.PostDto;
import com.synapse.dto.UpdatePostRequest;
import com.synapse.dto.VerifyPasswordRequest;
import com.synapse.entity.PostType;
import com.synapse.service.PostService;
import com.synapse.service.LikeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
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
@RequestMapping("/api/posts")
@RequiredArgsConstructor
@Tag(name = "Posts", description = "Post CRUD operations (Snippet, Article, Moment)")
public class PostController {

    private static final int MAX_PAGE_SIZE = 50;

    private final PostService postService;
    private final LikeService likeService;

    @GetMapping
    @Operation(summary = "Get posts", description = "Returns paginated posts, filterable by tag and type")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200",
            description = "Posts retrieved successfully")
    })
    public ResponseEntity<ApiResponse<Page<PostDto>>> getPosts(
            @Parameter(description = "Filter by tag name") @RequestParam(required = false) String tag,
            @Parameter(description = "Filter by post type") @RequestParam(required = false) PostType type,
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size (max 50)") @RequestParam(defaultValue = "10") int size,
            HttpServletRequest request) {
        int safeSize = Math.min(Math.max(size, 1), MAX_PAGE_SIZE);
        Pageable pageable = PageRequest.of(page, safeSize);
        Long userId = (Long) request.getAttribute("userId");
        Page<PostDto> posts = postService.getPosts(tag, type, pageable)
                .map(dto -> {
                    if (userId != null && dto.getUserState() != null) {
                        dto.getUserState().setLiked(likeService.hasLikedPost(userId, dto.getId()));
                    }
                    return dto;
                });
        return ResponseEntity.ok(ApiResponse.success(posts));
    }

    @GetMapping("/search")
    @Operation(summary = "Search posts",
            description = "Searches posts by keyword with optional tag and type filters")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200",
            description = "Search results returned")
    })
    public ResponseEntity<ApiResponse<Page<PostDto>>> searchPosts(
            @Parameter(description = "Search keyword", required = true) @RequestParam String keyword,
            @Parameter(description = "Filter by single tag") @RequestParam(required = false) String tag,
            @Parameter(description = "Filter by multiple tags")
            @RequestParam(required = false) java.util.List<String> tags,
            @Parameter(description = "Filter by post type") @RequestParam(required = false) PostType type,
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size (max 50)") @RequestParam(defaultValue = "10") int size,
            HttpServletRequest request) {
        int safeSize = Math.min(Math.max(size, 1), MAX_PAGE_SIZE);
        Pageable pageable = PageRequest.of(page, safeSize);
        java.util.LinkedHashSet<String> merged = new java.util.LinkedHashSet<>();
        if (tags != null) {
            merged.addAll(tags);
        }
        if (tag != null && !tag.trim().isEmpty()) {
            merged.add(tag.trim());
        }
        java.util.List<String> finalTags = merged.isEmpty() ? null : new java.util.ArrayList<>(merged);

        Long userId = (Long) request.getAttribute("userId");
        Page<PostDto> posts = postService.searchPosts(keyword, finalTags, type, pageable)
                .map(dto -> {
                    if (userId != null && dto.getUserState() != null) {
                        dto.getUserState().setLiked(likeService.hasLikedPost(userId, dto.getId()));
                    }
                    return dto;
                });
        return ResponseEntity.ok(ApiResponse.success(posts));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get post by ID", description = "Returns a single post with full details")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200",
            description = "Post retrieved successfully"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "404",
            description = "Post not found")
    })
    public ResponseEntity<ApiResponse<PostDto>> getPost(HttpServletRequest request, @PathVariable Long id) {
        try {
            Long userId = (Long) request.getAttribute("userId");
            PostDto post = postService.getPost(id, userId);
            if (userId != null && post.getUserState() != null) {
                post.getUserState().setLiked(likeService.hasLikedPost(userId, post.getId()));
            }
            return ResponseEntity.ok(ApiResponse.success(post));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(404).body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping
    @Operation(summary = "Create post", description = "Creates a new post (Snippet, Article, or Moment)")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200",
            description = "Post created successfully"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "401",
            description = "Not authenticated"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "400",
            description = "Invalid input")
    })
    public ResponseEntity<ApiResponse<PostDto>> createPost(
            HttpServletRequest request,
            @Valid @RequestBody CreatePostRequest createRequest) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Not authenticated"));
        }
        try {
            PostDto post = postService.createPost(userId, createRequest);
            return ResponseEntity.ok(ApiResponse.success("Post created successfully", post));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update post", description = "Updates an existing post (owner only)")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200",
            description = "Post updated successfully"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "401",
            description = "Not authenticated"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "403",
            description = "Not authorized")
    })
    public ResponseEntity<ApiResponse<PostDto>> updatePost(
            HttpServletRequest request,
            @PathVariable Long id,
            @Valid @RequestBody UpdatePostRequest updateRequest) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Not authenticated"));
        }
        try {
            PostDto post = postService.updatePost(id, userId, updateRequest);
            return ResponseEntity.ok(ApiResponse.success("Post updated successfully", post));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(403).body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete post", description = "Deletes a post (owner only)")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200",
            description = "Post deleted successfully"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "401",
            description = "Not authenticated"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "403",
            description = "Not authorized")
    })
    public ResponseEntity<ApiResponse<Void>> deletePost(
            HttpServletRequest request,
            @PathVariable Long id) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Not authenticated"));
        }
        try {
            postService.deletePost(id, userId);
            return ResponseEntity.ok(ApiResponse.success("Post deleted successfully", null));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(403).body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/{id}/verify-password")
    @Operation(summary = "Verify post password", description = "Verifies password for private posts")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Password verified"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Incorrect password"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Post not found")
    })
    public ResponseEntity<ApiResponse<PostDto>> verifyPassword(
            HttpServletRequest request,
            @PathVariable Long id,
            @Valid @RequestBody VerifyPasswordRequest verifyRequest) {
        try {
            Long userId = (Long) request.getAttribute("userId");
            PostDto post = postService.verifyPassword(id, verifyRequest.getPassword(), userId);
            if (userId != null && post.getUserState() != null) {
                post.getUserState().setLiked(likeService.hasLikedPost(userId, post.getId()));
            }
            return ResponseEntity.ok(ApiResponse.success(post));
        } catch (IllegalArgumentException e) {
            if ("Incorrect password".equals(e.getMessage())) {
                return ResponseEntity.status(401).body(ApiResponse.error(e.getMessage()));
            }
            return ResponseEntity.status(404).body(ApiResponse.error(e.getMessage()));
        }
    }
}
