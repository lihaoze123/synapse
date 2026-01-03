package com.synapse.service;

import com.synapse.dto.FollowDto;
import com.synapse.entity.Follow;
import com.synapse.entity.NotificationType;
import com.synapse.entity.User;
import com.synapse.repository.FollowRepository;
import com.synapse.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class FollowService {

    private final FollowRepository followRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Transactional(readOnly = true)
    public Page<FollowDto> getFollowing(Long userId, Pageable pageable) {
        if (!userRepository.existsById(userId)) {
            throw new IllegalArgumentException("User not found");
        }
        return followRepository.findByFollowerIdOrderByCreatedAtDesc(userId, pageable)
                .map(FollowDto::fromEntity);
    }

    @Transactional(readOnly = true)
    public Page<FollowDto> getFollowers(Long userId, Pageable pageable) {
        if (!userRepository.existsById(userId)) {
            throw new IllegalArgumentException("User not found");
        }
        return followRepository.findByFollowingIdOrderByCreatedAtDesc(userId, pageable)
                .map(FollowDto::fromEntity);
    }

    @Cacheable(value = "counts", key = "'isFollowing:' + #followerId + ':' + #followingId")
    @Transactional(readOnly = true)
    public boolean isFollowing(Long followerId, Long followingId) {
        return followRepository.existsByFollowerIdAndFollowingId(followerId, followingId);
    }

    @Caching(evict = {
        @CacheEvict(value = "counts", key = "'following:' + #followerId"),
        @CacheEvict(value = "counts", key = "'followers:' + #followingId"),
        @CacheEvict(value = "counts", key = "'isFollowing:' + #followerId + ':' + #followingId")
    })
    @Transactional
    public FollowDto followUser(Long followerId, Long followingId) {
        if (followerId.equals(followingId)) {
            throw new IllegalArgumentException("Cannot follow yourself");
        }

        User follower = userRepository.findById(followerId)
                .orElseThrow(() -> new IllegalArgumentException("Follower user not found"));

        User following = userRepository.findById(followingId)
                .orElseThrow(() -> new IllegalArgumentException("User to follow not found"));

        if (followRepository.existsByFollowerIdAndFollowingId(followerId, followingId)) {
            throw new IllegalArgumentException("Already following this user");
        }

        Follow follow = Follow.builder()
                .follower(follower)
                .following(following)
                .build();

        Follow saved = followRepository.save(follow);

        notificationService.createNotification(
                following, follower, NotificationType.FOLLOW, null, null);

        return FollowDto.fromEntity(saved);
    }

    @Caching(evict = {
        @CacheEvict(value = "counts", key = "'following:' + #followerId"),
        @CacheEvict(value = "counts", key = "'followers:' + #followingId"),
        @CacheEvict(value = "counts", key = "'isFollowing:' + #followerId + ':' + #followingId")
    })
    @Transactional
    public void unfollowUser(Long followerId, Long followingId) {
        if (!followRepository.existsByFollowerIdAndFollowingId(followerId, followingId)) {
            throw new IllegalArgumentException("Not following this user");
        }
        followRepository.deleteByFollowerIdAndFollowingId(followerId, followingId);
    }

    @Cacheable(value = "counts", key = "'following:' + #userId")
    @Transactional(readOnly = true)
    public long getFollowingCount(Long userId) {
        return followRepository.countByFollowerId(userId);
    }

    @Cacheable(value = "counts", key = "'followers:' + #userId")
    @Transactional(readOnly = true)
    public long getFollowerCount(Long userId) {
        return followRepository.countByFollowingId(userId);
    }
}
