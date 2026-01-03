package com.synapse.service;

import com.synapse.dto.NotificationDto;
import com.synapse.entity.Comment;
import com.synapse.entity.Notification;
import com.synapse.entity.NotificationType;
import com.synapse.entity.Post;
import com.synapse.entity.User;
import com.synapse.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

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
    }

    @CacheEvict(value = "counts", key = "'unreadNotifications:' + #userId")
    @Transactional
    public void markAllAsRead(Long userId) {
        notificationRepository.markAllAsRead(userId);
    }
}
