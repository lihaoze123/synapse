package com.synapse.service;

import com.synapse.dto.NotificationDto;
import com.synapse.entity.Comment;
import com.synapse.entity.Notification;
import com.synapse.entity.NotificationType;
import com.synapse.entity.Post;
import com.synapse.entity.User;
import com.synapse.repository.NotificationRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("NotificationService Tests")
class NotificationServiceTest {

    @Mock
    private NotificationRepository notificationRepository;

    @InjectMocks
    private NotificationService notificationService;

    @Test
    @DisplayName("createNotification should save notification when recipient and actor differ")
    void createNotification_shouldSaveNotification() {
        User recipient = User.builder().id(1L).username("recipient").build();
        User actor = User.builder().id(2L).username("actor").build();
        Post post = Post.builder().id(1L).build();

        notificationService.createNotification(recipient, actor, NotificationType.LIKE, post, null);

        verify(notificationRepository).save(any(Notification.class));
    }

    @Test
    @DisplayName("createNotification should not save notification when recipient is actor")
    void createNotification_shouldNotSaveWhenRecipientIsActor() {
        User user = User.builder().id(1L).username("user").build();
        Post post = Post.builder().id(1L).build();

        notificationService.createNotification(user, user, NotificationType.LIKE, post, null);

        verify(notificationRepository, never()).save(any(Notification.class));
    }

    @Test
    @DisplayName("createNotification should save notification with comment")
    void createNotification_shouldSaveNotificationWithComment() {
        User recipient = User.builder().id(1L).username("recipient").build();
        User actor = User.builder().id(2L).username("actor").build();
        Post post = Post.builder().id(1L).build();
        Comment comment = Comment.builder().id(1L).content("Nice post!").build();

        notificationService.createNotification(recipient, actor, NotificationType.COMMENT, post, comment);

        verify(notificationRepository).save(any(Notification.class));
    }

    @Test
    @DisplayName("getNotifications should return paginated notifications")
    void getNotifications_shouldReturnPaginatedNotifications() {
        User user = User.builder().id(1L).username("user").build();
        User actor = User.builder().id(2L).username("actor").build();
        Post post = Post.builder().id(1L).title("Test Post").build();

        Notification notification = Notification.builder()
                .id(1L)
                .user(user)
                .actor(actor)
                .type(NotificationType.LIKE)
                .post(post)
                .isRead(false)
                .createdAt(Instant.now())
                .build();

        when(notificationRepository.findByUserIdOrderByCreatedAtDesc(1L, PageRequest.of(0, 10)))
                .thenReturn(new PageImpl<>(List.of(notification)));

        Page<NotificationDto> result = notificationService.getNotifications(1L, PageRequest.of(0, 10));

        assertNotNull(result);
        assertEquals(1, result.getContent().size());
        assertEquals(NotificationType.LIKE, result.getContent().get(0).getType());
    }

    @Test
    @DisplayName("getUnreadCount should return count of unread notifications")
    void getUnreadCount_shouldReturnCount() {
        when(notificationRepository.countByUserIdAndIsReadFalse(1L)).thenReturn(5L);

        long result = notificationService.getUnreadCount(1L);

        assertEquals(5L, result);
    }

    @Test
    @DisplayName("getUnreadCount should return zero when no unread notifications")
    void getUnreadCount_shouldReturnZero() {
        when(notificationRepository.countByUserIdAndIsReadFalse(1L)).thenReturn(0L);

        long result = notificationService.getUnreadCount(1L);

        assertEquals(0L, result);
    }

    @Test
    @DisplayName("markAsRead should mark notification as read")
    void markAsRead_shouldMarkNotificationAsRead() {
        notificationService.markAsRead(1L, 1L);

        verify(notificationRepository).markAsRead(1L, 1L);
    }

    @Test
    @DisplayName("markAllAsRead should mark all notifications as read")
    void markAllAsRead_shouldMarkAllAsRead() {
        notificationService.markAllAsRead(1L);

        verify(notificationRepository).markAllAsRead(1L);
    }

    @Test
    @DisplayName("createNotification should handle different notification types")
    void createNotification_shouldHandleDifferentTypes() {
        User recipient = User.builder().id(1L).username("recipient").build();
        User actor = User.builder().id(2L).username("actor").build();
        Post post = Post.builder().id(1L).build();

        notificationService.createNotification(recipient, actor, NotificationType.FOLLOW, post, null);
        notificationService.createNotification(recipient, actor, NotificationType.MENTION, post, null);

        verify(notificationRepository, times(2)).save(any(Notification.class));
    }
}
