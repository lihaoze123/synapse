package com.synapse.controller;

import com.synapse.dto.ApiResponse;
import com.synapse.dto.CreatePostRequest;
import com.synapse.dto.PostDto;
import com.synapse.dto.UpdatePostRequest;
import com.synapse.entity.PostType;
import com.synapse.service.PostService;
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
public class PostController {

    private static final int MAX_PAGE_SIZE = 50;

    private final PostService postService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<PostDto>>> getPosts(
            @RequestParam(required = false) String tag,
            @RequestParam(required = false) PostType type,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        int safeSize = Math.min(Math.max(size, 1), MAX_PAGE_SIZE);
        Pageable pageable = PageRequest.of(page, safeSize);
        Page<PostDto> posts = postService.getPosts(tag, type, pageable);
        return ResponseEntity.ok(ApiResponse.success(posts));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<Page<PostDto>>> searchPosts(
            @RequestParam String keyword,
            @RequestParam(required = false) PostType type,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        int safeSize = Math.min(Math.max(size, 1), MAX_PAGE_SIZE);
        Pageable pageable = PageRequest.of(page, safeSize);
        Page<PostDto> posts = postService.searchPosts(keyword, type, pageable);
        return ResponseEntity.ok(ApiResponse.success(posts));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PostDto>> getPost(@PathVariable Long id) {
        try {
            PostDto post = postService.getPost(id);
            return ResponseEntity.ok(ApiResponse.success(post));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(404).body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping
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
}
