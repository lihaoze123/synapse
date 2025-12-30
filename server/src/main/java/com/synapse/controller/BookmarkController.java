package com.synapse.controller;

import com.synapse.dto.ApiResponse;
import com.synapse.dto.BookmarkDto;
import com.synapse.service.BookmarkService;
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
public class BookmarkController {

    private static final int MAX_PAGE_SIZE = 50;

    private final BookmarkService bookmarkService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<BookmarkDto>>> getUserBookmarks(
            HttpServletRequest request,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
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
    public ResponseEntity<ApiResponse<Boolean>> checkBookmark(
            HttpServletRequest request,
            @PathVariable Long postId) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Not authenticated"));
        }

        boolean isBookmarked = bookmarkService.isBookmarked(userId, postId);
        return ResponseEntity.ok(ApiResponse.success(isBookmarked));
    }

    @GetMapping("/posts/{postId}/count")
    public ResponseEntity<ApiResponse<Long>> getBookmarkCount(@PathVariable Long postId) {
        long count = bookmarkService.getBookmarkCount(postId);
        return ResponseEntity.ok(ApiResponse.success(count));
    }

    @PostMapping("/posts/{postId}")
    public ResponseEntity<ApiResponse<BookmarkDto>> addBookmark(
            HttpServletRequest request,
            @PathVariable Long postId) {
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
    public ResponseEntity<ApiResponse<Void>> removeBookmark(
            HttpServletRequest request,
            @PathVariable Long postId) {
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
