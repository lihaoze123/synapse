package com.synapse.service;

import com.synapse.dto.CommentDto;
import com.synapse.dto.CreateCommentRequest;
import com.synapse.dto.UpdateCommentRequest;
import com.synapse.entity.Comment;
import com.synapse.entity.NotificationType;
import com.synapse.entity.Post;
import com.synapse.entity.PostType;
import com.synapse.entity.User;
import com.synapse.repository.CommentRepository;
import com.synapse.repository.PostRepository;
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
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("CommentService Tests")
class CommentServiceTest {

    @Mock
    private CommentRepository commentRepository;

    @Mock
    private PostRepository postRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private CommentService commentService;

    @Test
    @DisplayName("getPostComments should return paginated comments")
    void getPostComments_shouldReturnPaginatedComments() {
        User user = User.builder().id(1L).username("user").build();
        Post post = Post.builder().id(1L).type(PostType.ARTICLE).title("Test").user(user).build();
        Comment comment = Comment.builder()
                .id(1L)
                .content("Great post!")
                .user(user)
                .post(post)
                .floor(1)
                .build();

        when(postRepository.existsById(1L)).thenReturn(true);
        when(commentRepository.findByPostIdOrderByFloorAsc(1L, PageRequest.of(0, 10)))
                .thenReturn(new PageImpl<>(List.of(comment)));

        Page<CommentDto> result = commentService.getPostComments(1L, PageRequest.of(0, 10));

        assertEquals(1, result.getContent().size());
        assertEquals("Great post!", result.getContent().get(0).getContent());
    }

    @Test
    @DisplayName("getPostComments should throw for non-existent post")
    void getPostComments_shouldThrowForNonExistentPost() {
        when(postRepository.existsById(999L)).thenReturn(false);

        assertThrows(IllegalArgumentException.class,
                () -> commentService.getPostComments(999L, PageRequest.of(0, 10)));
    }

    @Test
    @DisplayName("getComment should return comment")
    void getComment_shouldReturnComment() {
        User user = User.builder().id(1L).username("user").build();
        Post post = Post.builder().id(1L).type(PostType.ARTICLE).title("Test").user(user).build();
        Comment comment = Comment.builder()
                .id(1L)
                .content("Great post!")
                .user(user)
                .post(post)
                .build();

        when(commentRepository.findByIdWithUser(1L)).thenReturn(Optional.of(comment));

        CommentDto result = commentService.getComment(1L);

        assertNotNull(result);
        assertEquals("Great post!", result.getContent());
    }

    @Test
    @DisplayName("getComment should throw for non-existent comment")
    void getComment_shouldThrowForNonExistentComment() {
        when(commentRepository.findByIdWithUser(999L)).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> commentService.getComment(999L));
    }

    @Test
    @DisplayName("createComment should create top-level comment")
    void createComment_shouldCreateTopLevelComment() {
        User author = User.builder().id(1L).username("author").build();
        User commenter = User.builder().id(2L).username("commenter").build();
        Post post = Post.builder().id(1L).type(PostType.ARTICLE).title("Test").user(author).build();
        Comment comment = Comment.builder()
                .id(1L)
                .content("Great post!")
                .user(commenter)
                .post(post)
                .floor(1)
                .build();

        CreateCommentRequest request = new CreateCommentRequest();
        request.setContent("Great post!");
        request.setParentId(null);

        when(userRepository.findById(2L)).thenReturn(Optional.of(commenter));
        when(postRepository.findById(1L)).thenReturn(Optional.of(post));
        when(commentRepository.findMaxFloorByPostId(1L)).thenReturn(0);
        when(commentRepository.save(any(Comment.class))).thenReturn(comment);

        CommentDto result = commentService.createComment(2L, 1L, request);

        assertNotNull(result);
        assertEquals("Great post!", result.getContent());
        verify(notificationService).createNotification(author, commenter, NotificationType.COMMENT, post, comment);
    }

    @Test
    @DisplayName("createComment should create reply to parent comment")
    void createComment_shouldCreateReply() {
        User author = User.builder().id(1L).username("author").build();
        User commenter = User.builder().id(2L).username("commenter").build();
        Post post = Post.builder().id(1L).type(PostType.ARTICLE).title("Test").user(author).build();
        Comment parentComment = Comment.builder()
                .id(1L)
                .content("Original comment")
                .user(author)
                .post(post)
                .floor(1)
                .build();
        Comment reply = Comment.builder()
                .id(2L)
                .content("Reply")
                .user(commenter)
                .post(post)
                .parent(parentComment)
                .floor(2)
                .build();

        CreateCommentRequest request = new CreateCommentRequest();
        request.setContent("Reply");
        request.setParentId(1L);

        when(userRepository.findById(2L)).thenReturn(Optional.of(commenter));
        when(postRepository.findById(1L)).thenReturn(Optional.of(post));
        when(commentRepository.findById(1L)).thenReturn(Optional.of(parentComment));
        when(commentRepository.findMaxFloorByPostId(1L)).thenReturn(1);
        when(commentRepository.save(any(Comment.class))).thenReturn(reply);

        CommentDto result = commentService.createComment(2L, 1L, request);

        assertNotNull(result);
        assertEquals("Reply", result.getContent());
    }

    @Test
    @DisplayName("createComment should throw when replying to deleted comment")
    void createComment_shouldThrowWhenReplyingToDeletedComment() {
        User commenter = User.builder().id(2L).username("commenter").build();
        Post post = Post.builder().id(1L).type(PostType.ARTICLE).title("Test").user(commenter).build();
        Comment deletedComment = Comment.builder()
                .id(1L)
                .content("[已删除]")
                .user(commenter)
                .post(post)
                .floor(1)
                .isDeleted(true)
                .build();

        CreateCommentRequest request = new CreateCommentRequest();
        request.setContent("Reply");
        request.setParentId(1L);

        when(userRepository.findById(2L)).thenReturn(Optional.of(commenter));
        when(postRepository.findById(1L)).thenReturn(Optional.of(post));
        when(commentRepository.findById(1L)).thenReturn(Optional.of(deletedComment));

        assertThrows(IllegalArgumentException.class, () -> commentService.createComment(2L, 1L, request));
    }

    @Test
    @DisplayName("createComment should parse mentions")
    void createComment_shouldParseMentions() {
        User author = User.builder().id(1L).username("author").build();
        User mentionedUser = User.builder().id(3L).username("mentioned").build();
        User commenter = User.builder().id(2L).username("commenter").build();
        Post post = Post.builder().id(1L).type(PostType.ARTICLE).title("Test").user(author).build();
        Comment comment = Comment.builder()
                .id(1L)
                .content("@mentioned check this out!")
                .user(commenter)
                .post(post)
                .floor(1)
                .build();

        CreateCommentRequest request = new CreateCommentRequest();
        request.setContent("@mentioned check this out!");
        request.setParentId(null);

        when(userRepository.findById(2L)).thenReturn(Optional.of(commenter));
        when(postRepository.findById(1L)).thenReturn(Optional.of(post));
        when(commentRepository.findMaxFloorByPostId(1L)).thenReturn(0);
        when(commentRepository.save(any(Comment.class))).thenReturn(comment);
        when(userRepository.findByUsernameIn(any())).thenReturn(List.of(mentionedUser));

        commentService.createComment(2L, 1L, request);

        verify(notificationService).createNotification(mentionedUser, commenter, NotificationType.MENTION, post, comment);
    }

    @Test
    @DisplayName("updateComment should update content when owner")
    void updateComment_shouldUpdateContentWhenOwner() {
        User user = User.builder().id(1L).username("user").build();
        Post post = Post.builder().id(1L).type(PostType.ARTICLE).title("Test").user(user).build();
        Comment comment = Comment.builder()
                .id(1L)
                .content("Old content")
                .user(user)
                .post(post)
                .build();

        UpdateCommentRequest request = new UpdateCommentRequest();
        request.setContent("New content");

        when(commentRepository.findUserIdById(1L)).thenReturn(Optional.of(1L));
        when(commentRepository.findByIdWithUser(1L)).thenReturn(Optional.of(comment));
        when(commentRepository.save(any(Comment.class))).thenReturn(comment);

        CommentDto result = commentService.updateComment(1L, 1L, request);

        assertEquals("New content", result.getContent());
    }

    @Test
    @DisplayName("updateComment should throw when not owner")
    void updateComment_shouldThrowWhenNotOwner() {
        User owner = User.builder().id(1L).username("owner").build();

        when(commentRepository.findUserIdById(1L)).thenReturn(Optional.of(1L));

        UpdateCommentRequest request = new UpdateCommentRequest();
        request.setContent("New content");

        assertThrows(IllegalArgumentException.class, () -> commentService.updateComment(1L, 2L, request));
    }

    @Test
    @DisplayName("updateComment should throw when comment is deleted")
    void updateComment_shouldThrowWhenCommentIsDeleted() {
        User user = User.builder().id(1L).username("user").build();
        Post post = Post.builder().id(1L).type(PostType.ARTICLE).title("Test").user(user).build();
        Comment comment = Comment.builder()
                .id(1L)
                .content("[已删除]")
                .user(user)
                .post(post)
                .isDeleted(true)
                .build();

        UpdateCommentRequest request = new UpdateCommentRequest();
        request.setContent("New content");

        when(commentRepository.findUserIdById(1L)).thenReturn(Optional.of(1L));
        when(commentRepository.findByIdWithUser(1L)).thenReturn(Optional.of(comment));

        assertThrows(IllegalArgumentException.class, () -> commentService.updateComment(1L, 1L, request));
    }

    @Test
    @DisplayName("deleteComment should mark as deleted when owner")
    void deleteComment_shouldMarkAsDeletedWhenOwner() {
        User user = User.builder().id(1L).username("user").build();
        Post post = Post.builder().id(1L).type(PostType.ARTICLE).title("Test").user(user).build();
        Comment comment = Comment.builder()
                .id(1L)
                .content("Original content")
                .user(user)
                .post(post)
                .build();

        when(commentRepository.findUserIdById(1L)).thenReturn(Optional.of(1L));
        when(commentRepository.findByIdWithUser(1L)).thenReturn(Optional.of(comment));
        when(commentRepository.save(any(Comment.class))).thenReturn(comment);

        commentService.deleteComment(1L, 1L);

        verify(commentRepository).save(comment);
    }

    @Test
    @DisplayName("deleteComment should throw when not owner")
    void deleteComment_shouldThrowWhenNotOwner() {
        User owner = User.builder().id(1L).username("owner").build();

        when(commentRepository.findUserIdById(1L)).thenReturn(Optional.of(1L));

        assertThrows(IllegalArgumentException.class, () -> commentService.deleteComment(1L, 2L));
    }
}
