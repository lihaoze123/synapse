package com.synapse.service;

import com.synapse.dto.CommentDto;
import com.synapse.dto.CreateCommentRequest;
import com.synapse.dto.UpdateCommentRequest;
import com.synapse.entity.Comment;
import com.synapse.entity.Post;
import com.synapse.entity.User;
import com.synapse.repository.CommentRepository;
import com.synapse.repository.PostRepository;
import com.synapse.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;

    private static final int MAX_REPLY_DEPTH = 3;

    @Transactional(readOnly = true)
    public Page<CommentDto> getPostComments(Long postId, Pageable pageable) {
        if (!postRepository.existsById(postId)) {
            throw new IllegalArgumentException("Post not found");
        }
        return commentRepository.findByPostIdAndParentIsNullOrderByCreatedAtDesc(postId, pageable)
                .map(CommentDto::fromEntity);
    }

    @Transactional(readOnly = true)
    public Page<CommentDto> getCommentReplies(Long commentId, Pageable pageable) {
        return commentRepository.findByParentIdOrderByCreatedAtAsc(commentId, pageable)
                .map(CommentDto::fromEntity);
    }

    @Transactional(readOnly = true)
    public CommentDto getComment(Long id) {
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Comment not found"));
        return CommentDto.fromEntityWithReplies(comment);
    }

    @Transactional
    public CommentDto createComment(Long userId, Long postId, CreateCommentRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("Post not found"));

        Comment parentComment = null;
        int replyDepth = 0;

        if (request.getParentId() != null) {
            parentComment = commentRepository.findById(request.getParentId())
                    .orElseThrow(() -> new IllegalArgumentException("Parent comment not found"));

            if (!parentComment.getPost().getId().equals(postId)) {
                throw new IllegalArgumentException("Parent comment does not belong to this post");
            }

            replyDepth = calculateReplyDepth(parentComment);
            if (replyDepth >= MAX_REPLY_DEPTH) {
                throw new IllegalArgumentException("Maximum reply depth exceeded");
            }
        }

        Comment comment = Comment.builder()
                .content(request.getContent())
                .user(user)
                .post(post)
                .parent(parentComment)
                .build();

        Comment saved = commentRepository.save(comment);
        return CommentDto.fromEntity(saved);
    }

    @Transactional
    public CommentDto updateComment(Long commentId, Long userId, UpdateCommentRequest request) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("Comment not found"));

        if (!comment.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Not authorized to edit this comment");
        }

        comment.setContent(request.getContent());
        Comment saved = commentRepository.save(comment);
        return CommentDto.fromEntity(saved);
    }

    @Transactional
    public void deleteComment(Long commentId, Long userId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("Comment not found"));

        if (!comment.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Not authorized to delete this comment");
        }

        // Soft delete
        comment.setIsDeleted(true);
        comment.setContent("[已删除]");
        commentRepository.save(comment);
    }

    private int calculateReplyDepth(Comment comment) {
        int depth = 0;
        Comment current = comment;
        while (current.getParent() != null) {
            depth++;
            current = current.getParent();
            if (depth > MAX_REPLY_DEPTH) {
                break;
            }
        }
        return depth;
    }
}
