package com.synapse.service;

import com.synapse.entity.Like;
import com.synapse.entity.NotificationType;
import com.synapse.entity.Post;
import com.synapse.entity.User;
import com.synapse.repository.LikeRepository;
import com.synapse.repository.PostRepository;
import com.synapse.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class LikeService {

    private final LikeRepository likeRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public record ToggleResult(boolean liked, long count) {}

    @Transactional
    public ToggleResult togglePostLike(Long userId, Long postId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("Post not found"));

        boolean exists = likeRepository.existsByUserIdAndPostId(userId, postId);
        if (exists) {
            likeRepository.deleteByUserIdAndPostId(userId, postId);
            likeRepository.decrementPostLikeCount(postId);
        } else {
            Like like = Like.builder().user(user).post(post).build();
            likeRepository.save(like);
            likeRepository.incrementPostLikeCount(postId);
            notificationService.createNotification(
                    post.getUser(), user, NotificationType.LIKE, post, null);
        }
        long count = likeRepository.countByPostId(postId);
        return new ToggleResult(!exists, count);
    }

    @Transactional(readOnly = true)
    public boolean hasLikedPost(Long userId, Long postId) {
        return likeRepository.existsByUserIdAndPostId(userId, postId);
    }
}

