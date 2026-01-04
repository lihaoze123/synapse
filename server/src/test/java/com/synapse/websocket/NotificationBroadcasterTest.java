package com.synapse.websocket;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
@DisplayName("NotificationBroadcaster Tests")
class NotificationBroadcasterTest {

    @Mock
    private NotificationWebSocketHandler wsHandler;

    private NotificationBroadcaster broadcaster;

    @BeforeEach
    void setUp() {
        broadcaster = new NotificationBroadcaster(wsHandler);
    }

    @Test
    @DisplayName("sendUnreadCount should delegate with correct payload")
    void sendUnreadCount_shouldDelegateWithCorrectPayload() {
        Long userId = 123L;
        long count = 5L;

        broadcaster.sendUnreadCount(userId, count);

        ArgumentCaptor<Object> payloadCaptor = ArgumentCaptor.forClass(Object.class);
        verify(wsHandler).sendToUser(eq(userId), payloadCaptor.capture());

        Object capturedPayload = payloadCaptor.getValue();
        assertEquals(NotificationBroadcaster.UnreadCountMessage.class, capturedPayload.getClass());

        NotificationBroadcaster.UnreadCountMessage message =
            (NotificationBroadcaster.UnreadCountMessage) capturedPayload;
        assertEquals("unreadCount", message.type());
        assertEquals(count, message.count());
    }

    @Test
    @DisplayName("sendNewNotification should delegate with correct payload")
    void sendNewNotification_shouldDelegateWithCorrectPayload() {
        Long userId = 456L;
        Object notificationDto = new TestNotificationDto("test message");

        broadcaster.sendNewNotification(userId, notificationDto);

        ArgumentCaptor<Object> payloadCaptor = ArgumentCaptor.forClass(Object.class);
        verify(wsHandler).sendToUser(eq(userId), payloadCaptor.capture());

        Object capturedPayload = payloadCaptor.getValue();
        assertEquals(NotificationBroadcaster.NewNotificationMessage.class, capturedPayload.getClass());

        NotificationBroadcaster.NewNotificationMessage message =
            (NotificationBroadcaster.NewNotificationMessage) capturedPayload;
        assertEquals("notification", message.type());
        assertEquals(notificationDto, message.notification());
    }

    @Test
    @DisplayName("UnreadCountMessage canonical constructor should set type and count")
    void unreadCountMessage_canonicalConstructor_shouldSetTypeAndCount() {
        String type = "unreadCount";
        long count = 10L;

        NotificationBroadcaster.UnreadCountMessage message =
            new NotificationBroadcaster.UnreadCountMessage(type, count);

        assertEquals(type, message.type());
        assertEquals(count, message.count());
    }

    @Test
    @DisplayName("UnreadCountMessage compact constructor should set type to unreadCount")
    void unreadCountMessage_compactConstructor_shouldSetTypeToUnreadCount() {
        long count = 15L;

        NotificationBroadcaster.UnreadCountMessage message =
            new NotificationBroadcaster.UnreadCountMessage(count);

        assertEquals("unreadCount", message.type());
        assertEquals(count, message.count());
    }

    @Test
    @DisplayName("NewNotificationMessage canonical constructor should set type and notification")
    void newNotificationMessage_canonicalConstructor_shouldSetTypeAndNotification() {
        String type = "notification";
        Object notification = new TestNotificationDto("test content");

        NotificationBroadcaster.NewNotificationMessage message =
            new NotificationBroadcaster.NewNotificationMessage(type, notification);

        assertEquals(type, message.type());
        assertEquals(notification, message.notification());
    }

    @Test
    @DisplayName("NewNotificationMessage compact constructor should set type to notification")
    void newNotificationMessage_compactConstructor_shouldSetTypeToNotification() {
        Object notification = new TestNotificationDto("test data");

        NotificationBroadcaster.NewNotificationMessage message =
            new NotificationBroadcaster.NewNotificationMessage(notification);

        assertEquals("notification", message.type());
        assertEquals(notification, message.notification());
    }

    private record TestNotificationDto(String message) {}
}
