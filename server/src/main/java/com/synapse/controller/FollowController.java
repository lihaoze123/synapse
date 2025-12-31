package com.synapse.controller;

import com.synapse.dto.ApiResponse;
import com.synapse.dto.FollowCounts;
import com.synapse.dto.FollowDto;
import com.synapse.service.FollowService;
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
@RequestMapping("/api/follows")
@RequiredArgsConstructor
public class FollowController {

    private static final int MAX_PAGE_SIZE = 50;

    private final FollowService followService;

    @GetMapping("/following")
    public ResponseEntity<ApiResponse<Page<FollowDto>>> getFollowing(
            HttpServletRequest request,
            @RequestParam(required = false) Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Long targetUserId = userId;
        if (targetUserId == null) {
            targetUserId = (Long) request.getAttribute("userId");
            if (targetUserId == null) {
                return ResponseEntity.status(401).body(ApiResponse.error("Not authenticated"));
            }
        }

        int safeSize = Math.min(Math.max(size, 1), MAX_PAGE_SIZE);
        Pageable pageable = PageRequest.of(page, safeSize);
        Page<FollowDto> following = followService.getFollowing(targetUserId, pageable);
        return ResponseEntity.ok(ApiResponse.success(following));
    }

    @GetMapping("/followers")
    public ResponseEntity<ApiResponse<Page<FollowDto>>> getFollowers(
            HttpServletRequest request,
            @RequestParam(required = false) Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Long targetUserId = userId;
        if (targetUserId == null) {
            targetUserId = (Long) request.getAttribute("userId");
            if (targetUserId == null) {
                return ResponseEntity.status(401).body(ApiResponse.error("Not authenticated"));
            }
        }

        int safeSize = Math.min(Math.max(size, 1), MAX_PAGE_SIZE);
        Pageable pageable = PageRequest.of(page, safeSize);
        Page<FollowDto> followers = followService.getFollowers(targetUserId, pageable);
        return ResponseEntity.ok(ApiResponse.success(followers));
    }

    @GetMapping("/check/{userId}")
    public ResponseEntity<ApiResponse<Boolean>> checkFollowing(
            HttpServletRequest request,
            @PathVariable Long userId) {
        Long currentUserId = (Long) request.getAttribute("userId");
        if (currentUserId == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Not authenticated"));
        }

        boolean isFollowing = followService.isFollowing(currentUserId, userId);
        return ResponseEntity.ok(ApiResponse.success(isFollowing));
    }

    @GetMapping("/counts/{userId}")
    public ResponseEntity<ApiResponse<FollowCounts>> getFollowCounts(@PathVariable Long userId) {
        long followingCount = followService.getFollowingCount(userId);
        long followerCount = followService.getFollowerCount(userId);
        FollowCounts counts = new FollowCounts(followingCount, followerCount);
        return ResponseEntity.ok(ApiResponse.success(counts));
    }

    @PostMapping("/{userId}")
    public ResponseEntity<ApiResponse<FollowDto>> followUser(
            HttpServletRequest request,
            @PathVariable Long userId) {
        Long currentUserId = (Long) request.getAttribute("userId");
        if (currentUserId == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Not authenticated"));
        }

        try {
            FollowDto follow = followService.followUser(currentUserId, userId);
            return ResponseEntity.ok(ApiResponse.success("User followed", follow));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<ApiResponse<Void>> unfollowUser(
            HttpServletRequest request,
            @PathVariable Long userId) {
        Long currentUserId = (Long) request.getAttribute("userId");
        if (currentUserId == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Not authenticated"));
        }

        try {
            followService.unfollowUser(currentUserId, userId);
            return ResponseEntity.ok(ApiResponse.success("User unfollowed", null));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}
