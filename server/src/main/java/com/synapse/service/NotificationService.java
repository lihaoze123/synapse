package com.synapse.service;

import com.synapse.dto.NotificationDto;
import com.synapse.entity.Comment;
import com.synapse.entity.Notification;
import com.synapse.entity.NotificationType;
import com.synapse.entity.Post;
import com.synapse.entity.User;
import com.synapse.repository.NotificationRepository;
import com.synapse.websocket.NotificationBroadcaster;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final NotificationBroadcaster notificationBroadcaster;

    @CacheEvict(value = "counts", key = "'unreadNotifications:' + #recipient.id")
    @Transactional
    public void createNotification(User recipient, User actor, NotificationType type,
                                   Post post, Comment comment) {
        if (recipient.getId().equals(actor.getId())) {
            return;
        }

        Notification notification = Notification.builder()
                .user(recipient)
                .actor(actor)
                .type(type)
                .post(post)
                .comment(comment)
                .build();

        notificationRepository.save(notification);

        // Compute unread now, but only push after the transaction commits to avoid delaying commit
        long unread = notificationRepository.countByUserIdAndIsReadFalse(recipient.getId());
        NotificationDto dto = NotificationDto.fromEntity(notification);
        registerAfterCommit(() -> {
            try {
                notificationBroadcaster.sendUnreadCount(recipient.getId(), unread);
                // Also push the new notification so clients can refresh the list immediately
                notificationBroadcaster.sendNewNotification(recipient.getId(), dto);
            } catch (Exception e) {
                // Log failures so operators can diagnose WS issues; do not retry here
                log.warn(
                        "Failed to broadcast unread count after create (user={}): {}",
                        recipient.getId(),
                        e.getMessage(),
                        e);
            }
        });
    }

    @Transactional(readOnly = true)
    public Page<NotificationDto> getNotifications(Long userId, Pageable pageable) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(NotificationDto::fromEntity);
    }

    @Cacheable(value = "counts", key = "'unreadNotifications:' + #userId")
    @Transactional(readOnly = true)
    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    @CacheEvict(value = "counts", key = "'unreadNotifications:' + #userId")
    @Transactional
    public void markAsRead(Long notificationId, Long userId) {
        notificationRepository.markAsRead(notificationId, userId);
        long unread = notificationRepository.countByUserIdAndIsReadFalse(userId);
        registerAfterCommit(() -> {
            try {
                notificationBroadcaster.sendUnreadCount(userId, unread);
            } catch (Exception e) {
                log.warn("Failed to broadcast unread count after markAsRead (user={}): {}", userId, e.getMessage(), e);
            }
        });
    }

    @CacheEvict(value = "counts", key = "'unreadNotifications:' + #userId")
    @Transactional
    public void markAllAsRead(Long userId) {
        notificationRepository.markAllAsRead(userId);
        registerAfterCommit(() -> {
            try {
                notificationBroadcaster.sendUnreadCount(userId, 0L);
            } catch (Exception e) {
                log.warn(
                        "Failed to broadcast unread count after markAllAsRead (user={}): {}",
                        userId,
                        e.getMessage(),
                        e);
            }
        });
    }

    /**
     * Registers a callback to run only after the surrounding transaction commits successfully.
     * If no transaction is active, the action runs immediately.
     */
    private void registerAfterCommit(Runnable action) {
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    action.run();
                }
            });
        } else {
            action.run();
        }
    }
}
