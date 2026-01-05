package com.synapse.controller;

import com.synapse.dto.ApiResponse;
import com.synapse.dto.BookmarkDto;
import com.synapse.service.BookmarkService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/bookmarks")
@RequiredArgsConstructor
@Tag(name = "Bookmarks", description = "Post bookmark management")
public class BookmarkController {

    private static final int MAX_PAGE_SIZE = 50;

    private final BookmarkService bookmarkService;

    @GetMapping
    @Operation(summary = "Get user bookmarks", description = "Returns paginated bookmarks for current user")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Bookmarks retrieved successfully"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Not authenticated")
    })
    public ResponseEntity<ApiResponse<Page<BookmarkDto>>> getUserBookmarks(
            HttpServletRequest request,
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size (max 50)") @RequestParam(defaultValue = "20") int size) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Not authenticated"));
        }

        int safeSize = Math.min(Math.max(size, 1), MAX_PAGE_SIZE);
        Pageable pageable = PageRequest.of(page, safeSize);
        Page<BookmarkDto> bookmarks = bookmarkService.getUserBookmarks(userId, pageable);
        return ResponseEntity.ok(ApiResponse.success(bookmarks));
    }

    @GetMapping("/posts/{postId}")
    @Operation(summary = "Check bookmark status", description = "Checks if a post is bookmarked by current user")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Status retrieved successfully"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Not authenticated")
    })
    public ResponseEntity<ApiResponse<Boolean>> checkBookmark(
            HttpServletRequest request,
            @Parameter(description = "Post ID", required = true) @PathVariable Long postId) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Not authenticated"));
        }

        boolean isBookmarked = bookmarkService.isBookmarked(userId, postId);
        return ResponseEntity.ok(ApiResponse.success(isBookmarked));
    }

    @GetMapping("/posts/{postId}/count")
    @Operation(summary = "Get bookmark count", description = "Returns total bookmark count for a post")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Count retrieved successfully")
    })
    public ResponseEntity<ApiResponse<Long>> getBookmarkCount(@Parameter(description = "Post ID", required = true) @PathVariable Long postId) {
        long count = bookmarkService.getBookmarkCount(postId);
        return ResponseEntity.ok(ApiResponse.success(count));
    }

    @PostMapping("/posts/{postId}")
    @Operation(summary = "Add bookmark", description = "Adds a post to current user's bookmarks")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Bookmark added successfully"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Not authenticated"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid request")
    })
    public ResponseEntity<ApiResponse<BookmarkDto>> addBookmark(
            HttpServletRequest request,
            @Parameter(description = "Post ID", required = true) @PathVariable Long postId) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Not authenticated"));
        }

        try {
            BookmarkDto bookmark = bookmarkService.addBookmark(userId, postId);
            return ResponseEntity.ok(ApiResponse.success("Bookmark added", bookmark));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/posts/{postId}")
    @Operation(summary = "Remove bookmark", description = "Removes a post from current user's bookmarks")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Bookmark removed successfully"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Not authenticated"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid request")
    })
    public ResponseEntity<ApiResponse<Void>> removeBookmark(
            HttpServletRequest request,
            @Parameter(description = "Post ID", required = true) @PathVariable Long postId) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Not authenticated"));
        }

        try {
            bookmarkService.removeBookmark(userId, postId);
            return ResponseEntity.ok(ApiResponse.success("Bookmark removed", null));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}
