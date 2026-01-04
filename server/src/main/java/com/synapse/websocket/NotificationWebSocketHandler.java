package com.synapse.websocket;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.util.Collections;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

/**
 * Minimal WebSocket handler that keeps user-bound sessions in memory.
 * Used by NotificationBroadcaster to push realtime updates to recipients.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationWebSocketHandler extends TextWebSocketHandler {

    private final ObjectMapper objectMapper = new ObjectMapper();

    // userId -> sessions
    private final Map<Long, Set<WebSocketSession>> userSessions = new ConcurrentHashMap<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        Object userIdObj = session.getAttributes().get("userId");
        if (userIdObj instanceof Long userId) {
            userSessions.computeIfAbsent(userId, k -> ConcurrentHashMap.newKeySet()).add(session);
            log.debug("WS connected for user {}", userId);
        } else {
            // Reject if no user id provided by interceptor
            try {
                session.close(CloseStatus.NOT_ACCEPTABLE.withReason("Unauthorized"));
            } catch (IOException ignored) {
            }
        }
    }

    @Override
    public void handleTextMessage(WebSocketSession session, TextMessage message) {
        // This endpoint is push-only; ignore client messages
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        Object userIdObj = session.getAttributes().get("userId");
        if (userIdObj instanceof Long userId) {
            Set<WebSocketSession> sessions = userSessions.getOrDefault(userId, Collections.emptySet());
            sessions.remove(session);
            if (sessions.isEmpty()) {
                userSessions.remove(userId);
            }
            log.debug("WS disconnected for user {}", userId);
        }
    }

    public void sendToUser(Long userId, Object payload) {
        Set<WebSocketSession> sessions = userSessions.get(userId);
        if (sessions == null || sessions.isEmpty()) {
            return;
        }
        try {
            String text = objectMapper.writeValueAsString(payload);
            TextMessage msg = new TextMessage(text);
            sessions.forEach(s -> {
                if (s.isOpen()) {
                    try {
                        s.sendMessage(msg);
                    } catch (IOException e) {
                        log.debug("WS send failed: {}", e.getMessage());
                    }
                }
            });
        } catch (Exception e) {
            log.debug("WS serialization failed: {}", e.getMessage());
        }
    }
}

