package com.synapse.websocket;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class NotificationBroadcaster {

    private final NotificationWebSocketHandler wsHandler;

    public void sendUnreadCount(Long userId, long count) {
        wsHandler.sendToUser(userId, new UnreadCountMessage(count));
    }

    public void sendNewNotification(Long userId, Object notificationDto) {
        wsHandler.sendToUser(userId, new NewNotificationMessage(notificationDto));
    }

    // Simple JSON message envelopes
    public record UnreadCountMessage(String type, long count) {
        public UnreadCountMessage(long count) {
            this("unreadCount", count);
        }
    }

    public record NewNotificationMessage(String type, Object notification) {
        public NewNotificationMessage(Object notification) {
            this("notification", notification);
        }
    }
}

