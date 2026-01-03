package com.synapse.service;

import com.synapse.entity.Like;
import com.synapse.entity.NotificationType;
import com.synapse.entity.Post;
import com.synapse.entity.PostType;
import com.synapse.entity.User;
import com.synapse.repository.LikeRepository;
import com.synapse.repository.PostRepository;
import com.synapse.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("LikeService Tests")
class LikeServiceTest {

    @Mock
    private LikeRepository likeRepository;

    @Mock
    private PostRepository postRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private LikeService likeService;

    @Test
    @DisplayName("togglePostLike should create like when not exists")
    void togglePostLike_shouldCreateLikeWhenNotExists() {
        User user = User.builder().id(1L).username("user").build();
        User postOwner = User.builder().id(2L).username("owner").build();
        Post post = Post.builder().id(1L).type(PostType.ARTICLE).title("Test").user(postOwner).likeCount(0).build();
        Like like = Like.builder().id(1L).user(user).post(post).build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(postRepository.findById(1L)).thenReturn(Optional.of(post));
        when(likeRepository.existsByUserIdAndPostId(1L, 1L)).thenReturn(false);
        when(likeRepository.save(any(Like.class))).thenReturn(like);
        when(likeRepository.countByPostId(1L)).thenReturn(1L);

        LikeService.ToggleResult result = likeService.togglePostLike(1L, 1L);

        assertTrue(result.liked());
        assertEquals(1L, result.count());
        verify(likeRepository).save(any(Like.class));
        verify(likeRepository).incrementPostLikeCount(1L);
        verify(notificationService).createNotification(postOwner, user, NotificationType.LIKE, post, null);
    }

    @Test
    @DisplayName("togglePostLike should remove like when exists")
    void togglePostLike_shouldRemoveLikeWhenExists() {
        User user = User.builder().id(1L).username("user").build();
        User postOwner = User.builder().id(2L).username("owner").build();
        Post post = Post.builder().id(1L).type(PostType.ARTICLE).title("Test").user(postOwner).build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(postRepository.findById(1L)).thenReturn(Optional.of(post));
        when(likeRepository.existsByUserIdAndPostId(1L, 1L)).thenReturn(true);
        when(likeRepository.countByPostId(1L)).thenReturn(0L);

        LikeService.ToggleResult result = likeService.togglePostLike(1L, 1L);

        assertFalse(result.liked());
        assertEquals(0L, result.count());
        verify(likeRepository).deleteByUserIdAndPostId(1L, 1L);
        verify(likeRepository).decrementPostLikeCount(1L);
    }

    @Test
    @DisplayName("togglePostLike should throw for non-existent user")
    void togglePostLike_shouldThrowForNonExistentUser() {
        when(userRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> likeService.togglePostLike(1L, 1L));
    }

    @Test
    @DisplayName("togglePostLike should throw for non-existent post")
    void togglePostLike_shouldThrowForNonExistentPost() {
        User user = User.builder().id(1L).username("user").build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(postRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> likeService.togglePostLike(1L, 1L));
    }

    @Test
    @DisplayName("hasLikedPost should return true when liked")
    void hasLikedPost_shouldReturnTrueWhenLiked() {
        when(likeRepository.existsByUserIdAndPostId(1L, 1L)).thenReturn(true);

        boolean result = likeService.hasLikedPost(1L, 1L);

        assertTrue(result);
    }

    @Test
    @DisplayName("hasLikedPost should return false when not liked")
    void hasLikedPost_shouldReturnFalseWhenNotLiked() {
        when(likeRepository.existsByUserIdAndPostId(1L, 1L)).thenReturn(false);

        boolean result = likeService.hasLikedPost(1L, 1L);

        assertFalse(result);
    }
}
