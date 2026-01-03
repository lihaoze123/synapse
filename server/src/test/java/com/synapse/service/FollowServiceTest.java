package com.synapse.service;

import com.synapse.dto.FollowDto;
import com.synapse.entity.Follow;
import com.synapse.entity.User;
import com.synapse.repository.FollowRepository;
import com.synapse.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("FollowService Tests")
class FollowServiceTest {

    @Mock
    private FollowRepository followRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private FollowService followService;

    @Test
    @DisplayName("getFollowing should return paginated following list")
    void getFollowing_shouldReturnPaginatedFollowing() {
        User follower = User.builder().id(1L).username("follower").build();
        User following = User.builder().id(2L).username("following").build();
        Follow follow = Follow.builder().id(1L).follower(follower).following(following).build();

        when(userRepository.existsById(1L)).thenReturn(true);
        when(followRepository.findByFollowerIdOrderByCreatedAtDesc(1L, PageRequest.of(0, 10)))
                .thenReturn(new PageImpl<>(List.of(follow)));

        Page<FollowDto> result = followService.getFollowing(1L, PageRequest.of(0, 10));

        assertEquals(1, result.getContent().size());
        assertEquals(2L, result.getContent().get(0).getFollowing().getId());
    }

    @Test
    @DisplayName("getFollowing should throw for non-existent user")
    void getFollowing_shouldThrowForNonExistentUser() {
        when(userRepository.existsById(999L)).thenReturn(false);

        assertThrows(IllegalArgumentException.class,
                () -> followService.getFollowing(999L, PageRequest.of(0, 10)));
    }

    @Test
    @DisplayName("getFollowers should return paginated followers list")
    void getFollowers_shouldReturnPaginatedFollowers() {
        User follower = User.builder().id(1L).username("follower").build();
        User following = User.builder().id(2L).username("following").build();
        Follow follow = Follow.builder().id(1L).follower(follower).following(following).build();

        when(userRepository.existsById(2L)).thenReturn(true);
        when(followRepository.findByFollowingIdOrderByCreatedAtDesc(2L, PageRequest.of(0, 10)))
                .thenReturn(new PageImpl<>(List.of(follow)));

        Page<FollowDto> result = followService.getFollowers(2L, PageRequest.of(0, 10));

        assertEquals(1, result.getContent().size());
        assertEquals(1L, result.getContent().get(0).getFollower().getId());
    }

    @Test
    @DisplayName("isFollowing should return true when following")
    void isFollowing_shouldReturnTrueWhenFollowing() {
        when(followRepository.existsByFollowerIdAndFollowingId(1L, 2L)).thenReturn(true);

        boolean result = followService.isFollowing(1L, 2L);

        assertEquals(true, result);
    }

    @Test
    @DisplayName("isFollowing should return false when not following")
    void isFollowing_shouldReturnFalseWhenNotFollowing() {
        when(followRepository.existsByFollowerIdAndFollowingId(1L, 2L)).thenReturn(false);

        boolean result = followService.isFollowing(1L, 2L);

        assertEquals(false, result);
    }

    @Test
    @DisplayName("followUser should create follow relationship")
    void followUser_shouldCreateFollow() {
        User follower = User.builder().id(1L).username("follower").build();
        User following = User.builder().id(2L).username("following").build();
        Follow follow = Follow.builder().id(1L).follower(follower).following(following).build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(follower));
        when(userRepository.findById(2L)).thenReturn(Optional.of(following));
        when(followRepository.existsByFollowerIdAndFollowingId(1L, 2L)).thenReturn(false);
        when(followRepository.save(any(Follow.class))).thenReturn(follow);

        FollowDto result = followService.followUser(1L, 2L);

        assertNotNull(result);
        verify(followRepository).save(any(Follow.class));
        verify(notificationService).createNotification(following, follower,
                com.synapse.entity.NotificationType.FOLLOW, null, null);
    }

    @Test
    @DisplayName("followUser should throw when following self")
    void followUser_shouldThrowWhenFollowingSelf() {
        assertThrows(IllegalArgumentException.class, () -> followService.followUser(1L, 1L));
        verify(followRepository, never()).save(any(Follow.class));
    }

    @Test
    @DisplayName("followUser should throw when already following")
    void followUser_shouldThrowWhenAlreadyFollowing() {
        User follower = User.builder().id(1L).username("follower").build();
        User following = User.builder().id(2L).username("following").build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(follower));
        when(userRepository.findById(2L)).thenReturn(Optional.of(following));
        when(followRepository.existsByFollowerIdAndFollowingId(1L, 2L)).thenReturn(true);

        assertThrows(IllegalArgumentException.class, () -> followService.followUser(1L, 2L));
    }

    @Test
    @DisplayName("unfollowUser should delete follow relationship")
    void unfollowUser_shouldDeleteFollow() {
        when(followRepository.existsByFollowerIdAndFollowingId(1L, 2L)).thenReturn(true);

        followService.unfollowUser(1L, 2L);

        verify(followRepository).deleteByFollowerIdAndFollowingId(1L, 2L);
    }

    @Test
    @DisplayName("unfollowUser should throw when not following")
    void unfollowUser_shouldThrowWhenNotFollowing() {
        when(followRepository.existsByFollowerIdAndFollowingId(1L, 2L)).thenReturn(false);

        assertThrows(IllegalArgumentException.class, () -> followService.unfollowUser(1L, 2L));
    }

    @Test
    @DisplayName("getFollowingCount should return count")
    void getFollowingCount_shouldReturnCount() {
        when(followRepository.countByFollowerId(1L)).thenReturn(10L);

        long result = followService.getFollowingCount(1L);

        assertEquals(10L, result);
    }

    @Test
    @DisplayName("getFollowerCount should return count")
    void getFollowerCount_shouldReturnCount() {
        when(followRepository.countByFollowingId(1L)).thenReturn(20L);

        long result = followService.getFollowerCount(1L);

        assertEquals(20L, result);
    }
}
