package com.synapse.service;

import com.synapse.entity.Comment;
import com.synapse.entity.CommentLike;
import com.synapse.entity.User;
import com.synapse.repository.CommentLikeRepository;
import com.synapse.repository.CommentRepository;
import com.synapse.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CommentLikeService {

    private final CommentLikeRepository commentLikeRepository;
    private final CommentRepository commentRepository;
    private final UserRepository userRepository;

    public record ToggleResult(boolean liked, long count) {}

    @Transactional
    public ToggleResult toggleCommentLike(Long userId, Long commentId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("Comment not found"));

        boolean exists = commentLikeRepository.existsByUserIdAndCommentId(userId, commentId);
        if (exists) {
            commentLikeRepository.deleteByUserIdAndCommentId(userId, commentId);
            commentLikeRepository.decrementCommentLikeCount(commentId);
        } else {
            CommentLike like = CommentLike.builder().user(user).comment(comment).build();
            commentLikeRepository.save(like);
            commentLikeRepository.incrementCommentLikeCount(commentId);
        }
        long count = commentLikeRepository.countByCommentId(commentId);
        return new ToggleResult(!exists, count);
    }

    @Transactional(readOnly = true)
    public boolean hasLikedComment(Long userId, Long commentId) {
        return commentLikeRepository.existsByUserIdAndCommentId(userId, commentId);
    }
}

