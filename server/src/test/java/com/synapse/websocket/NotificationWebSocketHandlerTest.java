package com.synapse.websocket;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

import java.io.IOException;
import java.net.URI;
import java.util.HashMap;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

@ExtendWith(MockitoExtension.class)
@DisplayName("NotificationWebSocketHandler Tests")
class NotificationWebSocketHandlerTest {

    private NotificationWebSocketHandler handler;

    @Mock
    private WebSocketSession session;

    private Map<String, Object> sessionAttributes;

    @BeforeEach
    void setUp() throws IOException {
        handler = new NotificationWebSocketHandler();
        sessionAttributes = new HashMap<>();

        lenient().when(session.getAttributes()).thenReturn(sessionAttributes);
        lenient().when(session.getId()).thenReturn("test-session-id");
        lenient().when(session.getUri()).thenReturn(URI.create("ws://localhost/ws"));
        lenient().when(session.isOpen()).thenReturn(true);
    }

    @Test
    @DisplayName("afterConnectionEstablished should add session to userSessions")
    void afterConnectionEstablished_shouldAddSessionToUserSessions() throws IOException {
        Long userId = 123L;
        sessionAttributes.put("userId", userId);

        handler.afterConnectionEstablished(session);

        NotificationBroadcaster.UnreadCountMessage testPayload =
            new NotificationBroadcaster.UnreadCountMessage(5L);

        handler.sendToUser(userId, testPayload);

        verify(session).sendMessage(new TextMessage("{\"type\":\"unreadCount\",\"count\":5}"));
    }

    @Test
    @DisplayName("afterConnectionClosed should remove session")
    void afterConnectionClosed_shouldRemoveSession() throws IOException {
        Long userId = 123L;
        sessionAttributes.put("userId", userId);

        handler.afterConnectionEstablished(session);
        handler.afterConnectionClosed(session, CloseStatus.NORMAL);

        NotificationBroadcaster.UnreadCountMessage testPayload =
            new NotificationBroadcaster.UnreadCountMessage(5L);

        handler.sendToUser(userId, testPayload);

        verify(session, never()).sendMessage(new TextMessage("{\"type\":\"unreadCount\",\"count\":5}"));
    }

    @Test
    @DisplayName("afterConnectionEstablished should close unauthorized session")
    void afterConnectionEstablished_shouldCloseUnauthorizedSession() throws IOException {
        handler.afterConnectionEstablished(session);

        verify(session).close(CloseStatus.NOT_ACCEPTABLE.withReason("Unauthorized"));
    }

    @Test
    @DisplayName("sendToUser should send to all sessions for a user")
    void sendToUser_shouldSendToAllSessions() throws IOException {
        Long userId = 123L;

        Map<String, Object> attributes1 = new HashMap<>();
        attributes1.put("userId", userId);
        WebSocketSession session1 = mock(WebSocketSession.class);
        lenient().when(session1.getAttributes()).thenReturn(attributes1);
        lenient().when(session1.getId()).thenReturn("session-1");
        lenient().when(session1.isOpen()).thenReturn(true);

        Map<String, Object> attributes2 = new HashMap<>();
        attributes2.put("userId", userId);
        WebSocketSession session2 = mock(WebSocketSession.class);
        lenient().when(session2.getAttributes()).thenReturn(attributes2);
        lenient().when(session2.getId()).thenReturn("session-2");
        lenient().when(session2.isOpen()).thenReturn(true);

        handler.afterConnectionEstablished(session1);
        handler.afterConnectionEstablished(session2);

        NotificationBroadcaster.UnreadCountMessage testPayload =
            new NotificationBroadcaster.UnreadCountMessage(3L);
        handler.sendToUser(userId, testPayload);

        verify(session1).sendMessage(new TextMessage("{\"type\":\"unreadCount\",\"count\":3}"));
        verify(session2).sendMessage(new TextMessage("{\"type\":\"unreadCount\",\"count\":3}"));
    }

    @Test
    @DisplayName("sendToUser should skip closed sessions")
    void sendToUser_shouldSkipClosedSessions() throws IOException {
        Long userId = 123L;

        Map<String, Object> openAttributes = new HashMap<>();
        openAttributes.put("userId", userId);
        WebSocketSession openSession = mock(WebSocketSession.class);
        lenient().when(openSession.getAttributes()).thenReturn(openAttributes);
        lenient().when(openSession.getId()).thenReturn("open-session");
        lenient().when(openSession.isOpen()).thenReturn(true);

        Map<String, Object> closedAttributes = new HashMap<>();
        closedAttributes.put("userId", userId);
        WebSocketSession closedSession = mock(WebSocketSession.class);
        lenient().when(closedSession.getAttributes()).thenReturn(closedAttributes);
        lenient().when(closedSession.getId()).thenReturn("closed-session");
        lenient().when(closedSession.isOpen()).thenReturn(false);

        handler.afterConnectionEstablished(openSession);
        handler.afterConnectionEstablished(closedSession);

        NotificationBroadcaster.UnreadCountMessage testPayload =
            new NotificationBroadcaster.UnreadCountMessage(7L);
        handler.sendToUser(userId, testPayload);

        verify(openSession).sendMessage(new TextMessage("{\"type\":\"unreadCount\",\"count\":7}"));
        verify(closedSession, never()).sendMessage(new TextMessage("{\"type\":\"unreadCount\",\"count\":7}"));
    }

    @Test
    @DisplayName("sendToUser should handle non-existent user gracefully")
    void sendToUser_shouldHandleNonExistentUser() {
        Long nonExistentUserId = 999L;

        NotificationBroadcaster.UnreadCountMessage testPayload =
            new NotificationBroadcaster.UnreadCountMessage(10L);

        handler.sendToUser(nonExistentUserId, testPayload);

        assertTrue(true, "No exception should be thrown for non-existent user");
    }

    @Test
    @DisplayName("handleTextMessage should ignore client messages without error")
    void handleTextMessage_shouldIgnoreClientMessages() throws Exception {
        TextMessage message = new TextMessage("test message from client");

        handler.handleTextMessage(session, message);

        assertTrue(true, "handleTextMessage should ignore messages without throwing");
    }

    @Test
    @DisplayName("afterConnectionClosed with non-Long userId should not throw")
    void afterConnectionClosed_withNonLongUserId_shouldNotThrow() {
        sessionAttributes.put("userId", "not-a-long");

        handler.afterConnectionClosed(session, CloseStatus.NORMAL);

        assertTrue(true, "afterConnectionClosed should handle non-Long userId gracefully");
    }

    @Test
    @DisplayName("afterConnectionClosed with null userId should not throw")
    void afterConnectionClosed_withNullUserId_shouldNotThrow() {
        sessionAttributes.put("userId", null);

        handler.afterConnectionClosed(session, CloseStatus.NORMAL);

        assertTrue(true, "afterConnectionClosed should handle null userId gracefully");
    }

    @Test
    @DisplayName("afterConnectionEstablished with non-Long userId should close session")
    void afterConnectionEstablished_withNonLongUserId_shouldCloseSession() throws IOException {
        sessionAttributes.put("userId", "string-user-id");

        handler.afterConnectionEstablished(session);

        verify(session).close(CloseStatus.NOT_ACCEPTABLE.withReason("Unauthorized"));
    }

    @Test
    @DisplayName("sendToUser should handle serialization errors gracefully")
    void sendToUser_shouldHandleSerializationErrors() {
        Long userId = 123L;
        sessionAttributes.put("userId", userId);

        handler.afterConnectionEstablished(session);

        class UnserializableObject {
            @Override
            public String toString() {
                throw new RuntimeException("Serialization error");
            }
        }

        Object unserializablePayload = new UnserializableObject();

        handler.sendToUser(userId, unserializablePayload);

        assertTrue(true, "sendToUser should handle serialization errors without throwing");
    }

    @Test
    @DisplayName("sendToUser should handle IOException when sending message")
    void sendToUser_shouldHandleIOException() throws IOException {
        Long userId = 123L;
        sessionAttributes.put("userId", userId);

        doThrow(new IOException("Send failed"))
                .when(session)
                .sendMessage(org.mockito.ArgumentMatchers.any(TextMessage.class));

        handler.afterConnectionEstablished(session);

        NotificationBroadcaster.UnreadCountMessage testPayload =
            new NotificationBroadcaster.UnreadCountMessage(5L);

        handler.sendToUser(userId, testPayload);

        assertTrue(true, "sendToUser should handle IOException gracefully");
    }

    @Test
    @DisplayName("afterConnectionClosed should remove userId from map when last session closes")
    void afterConnectionClosed_shouldRemoveUserIdWhenLastSessionCloses() throws IOException {
        Long userId = 123L;
        sessionAttributes.put("userId", userId);

        handler.afterConnectionEstablished(session);
        handler.afterConnectionClosed(session, CloseStatus.NORMAL);

        NotificationBroadcaster.UnreadCountMessage testPayload =
            new NotificationBroadcaster.UnreadCountMessage(5L);

        handler.sendToUser(userId, testPayload);

        verify(session, never()).sendMessage(org.mockito.ArgumentMatchers.any(TextMessage.class));
    }

    @Test
    @DisplayName("sendToUser should handle NewNotificationMessage")
    void sendToUser_shouldHandleNewNotificationMessage() throws IOException {
        Long userId = 123L;
        sessionAttributes.put("userId", userId);

        handler.afterConnectionEstablished(session);

        Object notificationDto = new TestNotification("Test notification");
        NotificationBroadcaster.NewNotificationMessage testPayload =
            new NotificationBroadcaster.NewNotificationMessage(notificationDto);

        handler.sendToUser(userId, testPayload);

        verify(session).sendMessage(org.mockito.ArgumentMatchers.any(TextMessage.class));
    }

    @Test
    @DisplayName("sendToUser with multiple users should only send to target user")
    void sendToUser_withMultipleUsers_shouldOnlySendToTargetUser() throws IOException {
        Long user1 = 111L;
        Long user2 = 222L;

        Map<String, Object> attributes1 = new HashMap<>();
        attributes1.put("userId", user1);
        WebSocketSession session1 = mock(WebSocketSession.class);
        lenient().when(session1.getAttributes()).thenReturn(attributes1);
        lenient().when(session1.getId()).thenReturn("session-1");
        lenient().when(session1.isOpen()).thenReturn(true);

        Map<String, Object> attributes2 = new HashMap<>();
        attributes2.put("userId", user2);
        WebSocketSession session2 = mock(WebSocketSession.class);
        lenient().when(session2.getAttributes()).thenReturn(attributes2);
        lenient().when(session2.getId()).thenReturn("session-2");
        lenient().when(session2.isOpen()).thenReturn(true);

        handler.afterConnectionEstablished(session1);
        handler.afterConnectionEstablished(session2);

        NotificationBroadcaster.UnreadCountMessage testPayload =
            new NotificationBroadcaster.UnreadCountMessage(3L);
        handler.sendToUser(user1, testPayload);

        verify(session1).sendMessage(org.mockito.ArgumentMatchers.any(TextMessage.class));
        verify(session2, never()).sendMessage(org.mockito.ArgumentMatchers.any(TextMessage.class));
    }

    @Test
    @DisplayName("sendToUser should handle empty sessions set after removal")
    void sendToUser_shouldHandleEmptySessionsAfterRemoval() throws IOException {
        Long userId = 123L;
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("userId", userId);

        WebSocketSession tempSession = mock(WebSocketSession.class);
        lenient().when(tempSession.getAttributes()).thenReturn(attributes);
        lenient().when(tempSession.getId()).thenReturn("temp-session");
        lenient().when(tempSession.isOpen()).thenReturn(true);

        handler.afterConnectionEstablished(tempSession);
        handler.afterConnectionClosed(tempSession, CloseStatus.NORMAL);

        NotificationBroadcaster.UnreadCountMessage testPayload =
            new NotificationBroadcaster.UnreadCountMessage(5L);

        handler.sendToUser(userId, testPayload);

        verify(tempSession, never()).sendMessage(org.mockito.ArgumentMatchers.any(TextMessage.class));
    }

    private record TestNotification(String message) {}
}
