package com.synapse.service;

import com.synapse.entity.Comment;
import com.synapse.entity.CommentLike;
import com.synapse.entity.Post;
import com.synapse.entity.PostType;
import com.synapse.entity.User;
import com.synapse.repository.CommentLikeRepository;
import com.synapse.repository.CommentRepository;
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
@DisplayName("CommentLikeService Tests")
class CommentLikeServiceTest {

    @Mock
    private CommentLikeRepository commentLikeRepository;

    @Mock
    private CommentRepository commentRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private CommentLikeService commentLikeService;

    @Test
    @DisplayName("toggleCommentLike should create like when not exists")
    void toggleCommentLike_shouldCreateLikeWhenNotExists() {
        User user = User.builder().id(1L).username("user").build();
        Post post = Post.builder().id(1L).type(PostType.ARTICLE).title("Test").user(user).build();
        Comment comment = Comment.builder().id(1L).content("Nice post!").user(user).post(post).build();
        CommentLike like = CommentLike.builder().id(1L).user(user).comment(comment).build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(commentRepository.findById(1L)).thenReturn(Optional.of(comment));
        when(commentLikeRepository.existsByUserIdAndCommentId(1L, 1L)).thenReturn(false);
        when(commentLikeRepository.save(any(CommentLike.class))).thenReturn(like);
        when(commentLikeRepository.countByCommentId(1L)).thenReturn(1L);

        CommentLikeService.ToggleResult result = commentLikeService.toggleCommentLike(1L, 1L);

        assertTrue(result.liked());
        assertEquals(1L, result.count());
        verify(commentLikeRepository).save(any(CommentLike.class));
        verify(commentLikeRepository).incrementCommentLikeCount(1L);
    }

    @Test
    @DisplayName("toggleCommentLike should remove like when exists")
    void toggleCommentLike_shouldRemoveLikeWhenExists() {
        User user = User.builder().id(1L).username("user").build();
        Post post = Post.builder().id(1L).type(PostType.ARTICLE).title("Test").user(user).build();
        Comment comment = Comment.builder().id(1L).content("Nice post!").user(user).post(post).build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(commentRepository.findById(1L)).thenReturn(Optional.of(comment));
        when(commentLikeRepository.existsByUserIdAndCommentId(1L, 1L)).thenReturn(true);
        when(commentLikeRepository.countByCommentId(1L)).thenReturn(0L);

        CommentLikeService.ToggleResult result = commentLikeService.toggleCommentLike(1L, 1L);

        assertFalse(result.liked());
        assertEquals(0L, result.count());
        verify(commentLikeRepository).deleteByUserIdAndCommentId(1L, 1L);
        verify(commentLikeRepository).decrementCommentLikeCount(1L);
    }

    @Test
    @DisplayName("toggleCommentLike should throw for non-existent user")
    void toggleCommentLike_shouldThrowForNonExistentUser() {
        when(userRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> commentLikeService.toggleCommentLike(1L, 1L));
    }

    @Test
    @DisplayName("toggleCommentLike should throw for non-existent comment")
    void toggleCommentLike_shouldThrowForNonExistentComment() {
        User user = User.builder().id(1L).username("user").build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(commentRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> commentLikeService.toggleCommentLike(1L, 1L));
    }

    @Test
    @DisplayName("hasLikedComment should return true when liked")
    void hasLikedComment_shouldReturnTrueWhenLiked() {
        when(commentLikeRepository.existsByUserIdAndCommentId(1L, 1L)).thenReturn(true);

        boolean result = commentLikeService.hasLikedComment(1L, 1L);

        assertTrue(result);
    }

    @Test
    @DisplayName("hasLikedComment should return false when not liked")
    void hasLikedComment_shouldReturnFalseWhenNotLiked() {
        when(commentLikeRepository.existsByUserIdAndCommentId(1L, 1L)).thenReturn(false);

        boolean result = commentLikeService.hasLikedComment(1L, 1L);

        assertFalse(result);
    }
}
