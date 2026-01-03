package com.synapse.service;

import com.synapse.dto.CommentDto;
import com.synapse.dto.CreateCommentRequest;
import com.synapse.dto.UpdateCommentRequest;
import com.synapse.entity.Comment;
import com.synapse.entity.NotificationType;
import com.synapse.entity.Post;
import com.synapse.entity.User;
import com.synapse.repository.CommentRepository;
import com.synapse.repository.PostRepository;
import com.synapse.repository.UserRepository;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CommentService {

	private static final Pattern MENTION_PATTERN = Pattern.compile("@([a-zA-Z0-9_]+)");

	private final CommentRepository commentRepository;
	private final PostRepository postRepository;
	private final UserRepository userRepository;
	private final NotificationService notificationService;

	@Transactional(readOnly = true)
	public Page<CommentDto> getPostComments(Long postId, Pageable pageable) {
		if (!postRepository.existsById(postId)) {
			throw new IllegalArgumentException("Post not found");
		}

		Page<Comment> page = commentRepository.findByPostIdOrderByFloorAsc(postId, pageable);
		return page.map(CommentDto::fromEntity);
	}

	@Cacheable(value = "comments", key = "#id", unless = "#result == null")
	@Transactional(readOnly = true)
	public CommentDto getComment(Long id) {
		Comment comment = commentRepository.findByIdWithUser(id)
				.orElseThrow(() -> new IllegalArgumentException("Comment not found"));
		return CommentDto.fromEntity(comment);
	}

	@Transactional
	public CommentDto createComment(Long userId, Long postId, CreateCommentRequest request) {
		User user = userRepository.findById(userId)
				.orElseThrow(() -> new IllegalArgumentException("User not found"));

		Post post = postRepository.findById(postId)
				.orElseThrow(() -> new IllegalArgumentException("Post not found"));

		Comment parentComment = null;

		if (request.getParentId() != null) {
			parentComment = commentRepository.findById(request.getParentId())
					.orElseThrow(() -> new IllegalArgumentException("Parent comment not found"));

			if (parentComment.getIsDeleted()) {
				throw new IllegalArgumentException("Cannot reply to a deleted comment");
			}

			if (!parentComment.getPost().getId().equals(postId)) {
				throw new IllegalArgumentException("Parent comment does not belong to this post");
			}
		}

		Integer maxFloor = commentRepository.findMaxFloorByPostId(postId);
		int nextFloor = maxFloor + 1;

		Comment comment = Comment.builder()
				.content(request.getContent())
				.user(user)
				.post(post)
				.parent(parentComment)
				.floor(nextFloor)
				.build();

		Comment saved = commentRepository.save(comment);

		notificationService.createNotification(
				post.getUser(), user, NotificationType.COMMENT, post, saved);

		Set<String> mentionedUsernames = parseMentions(request.getContent());
		if (!mentionedUsernames.isEmpty()) {
			List<User> mentionedUsers = userRepository.findByUsernameIn(mentionedUsernames);
			for (User mentioned : mentionedUsers) {
				if (!mentioned.getId().equals(userId)
						&& !mentioned.getId().equals(post.getUser().getId())) {
					notificationService.createNotification(
							mentioned, user, NotificationType.MENTION, post, saved);
				}
			}
		}

		return CommentDto.fromEntity(saved);
	}

	private Set<String> parseMentions(String content) {
		Set<String> usernames = new HashSet<>();
		Matcher matcher = MENTION_PATTERN.matcher(content);
		while (matcher.find()) {
			usernames.add(matcher.group(1));
		}
		return usernames;
	}

	@CacheEvict(value = "comments", key = "#commentId")
	@Transactional
	public CommentDto updateComment(Long commentId, Long userId, UpdateCommentRequest request) {
		Long ownerUserId = commentRepository.findUserIdById(commentId)
				.orElseThrow(() -> new IllegalArgumentException("Comment not found"));

		if (!ownerUserId.equals(userId)) {
			throw new IllegalArgumentException("Not authorized to edit this comment");
		}

		Comment comment = commentRepository.findByIdWithUser(commentId)
				.orElseThrow(() -> new IllegalArgumentException("Comment not found"));

		if (comment.getIsDeleted()) {
			throw new IllegalArgumentException("Cannot edit a deleted comment");
		}

		comment.setContent(request.getContent());
		Comment saved = commentRepository.save(comment);
		return CommentDto.fromEntity(saved);
	}

	@CacheEvict(value = "comments", key = "#commentId")
	@Transactional
	public void deleteComment(Long commentId, Long userId) {
		Long ownerUserId = commentRepository.findUserIdById(commentId)
				.orElseThrow(() -> new IllegalArgumentException("Comment not found"));

		if (!ownerUserId.equals(userId)) {
			throw new IllegalArgumentException("Not authorized to delete this comment");
		}

		Comment comment = commentRepository.findByIdWithUser(commentId)
				.orElseThrow(() -> new IllegalArgumentException("Comment not found"));

		comment.setIsDeleted(true);
		comment.setContent("[已删除]");
		commentRepository.save(comment);
	}
}
