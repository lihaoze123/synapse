package com.synapse.controller;

import com.synapse.dto.ApiResponse;
import com.synapse.dto.FollowCounts;
import com.synapse.dto.FollowDto;
import com.synapse.service.FollowService;
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
@RequestMapping("/api/follows")
@RequiredArgsConstructor
@Tag(name = "Follows", description = "User follow/unfollow functionality")
public class FollowController {

    private static final int MAX_PAGE_SIZE = 50;

    private final FollowService followService;

    @GetMapping("/following")
    @Operation(summary = "Get following list", description = "Returns paginated list of users that a user is following")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Following list retrieved successfully"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Not authenticated")
    })
    public ResponseEntity<ApiResponse<Page<FollowDto>>> getFollowing(
            HttpServletRequest request,
            @Parameter(description = "User ID (defaults to current user)") @RequestParam(required = false) Long userId,
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size (max 50)") @RequestParam(defaultValue = "20") int size) {
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
    @Operation(summary = "Get followers list", description = "Returns paginated list of users following a user")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Followers list retrieved successfully"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Not authenticated")
    })
    public ResponseEntity<ApiResponse<Page<FollowDto>>> getFollowers(
            HttpServletRequest request,
            @Parameter(description = "User ID (defaults to current user)") @RequestParam(required = false) Long userId,
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size (max 50)") @RequestParam(defaultValue = "20") int size) {
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
    @Operation(summary = "Check following status", description = "Checks if current user is following another user")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Status retrieved successfully"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Not authenticated")
    })
    public ResponseEntity<ApiResponse<Boolean>> checkFollowing(
            HttpServletRequest request,
            @Parameter(description = "User ID to check", required = true) @PathVariable Long userId) {
        Long currentUserId = (Long) request.getAttribute("userId");
        if (currentUserId == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Not authenticated"));
        }

        boolean isFollowing = followService.isFollowing(currentUserId, userId);
        return ResponseEntity.ok(ApiResponse.success(isFollowing));
    }

    @GetMapping("/counts/{userId}")
    @Operation(summary = "Get follow counts", description = "Returns follower and following counts for a user")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Counts retrieved successfully")
    })
    public ResponseEntity<ApiResponse<FollowCounts>> getFollowCounts(
            @Parameter(description = "User ID", required = true) @PathVariable Long userId) {
        long followingCount = followService.getFollowingCount(userId);
        long followerCount = followService.getFollowerCount(userId);
        FollowCounts counts = new FollowCounts(followingCount, followerCount);
        return ResponseEntity.ok(ApiResponse.success(counts));
    }

    @PostMapping("/{userId}")
    @Operation(summary = "Follow user", description = "Follows a user")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200",
            description = "User followed successfully"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "401",
            description = "Not authenticated"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "400",
            description = "Invalid request")
    })
    public ResponseEntity<ApiResponse<FollowDto>> followUser(
            HttpServletRequest request,
            @Parameter(description = "User ID to follow", required = true) @PathVariable Long userId) {
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
    @Operation(summary = "Unfollow user", description = "Unfollows a user")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200",
            description = "User unfollowed successfully"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "401",
            description = "Not authenticated"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "400",
            description = "Invalid request")
    })
    public ResponseEntity<ApiResponse<Void>> unfollowUser(
            HttpServletRequest request,
            @Parameter(description = "User ID to unfollow", required = true) @PathVariable Long userId) {
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
