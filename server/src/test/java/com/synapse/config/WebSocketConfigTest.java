package com.synapse.config;

import com.synapse.websocket.JwtHandshakeInterceptor;
import com.synapse.websocket.NotificationWebSocketHandler;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistration;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@SpringBootTest(properties = {"spring.sql.init.mode=never"},
        classes = {WebSocketConfig.class, JwtHandshakeInterceptor.class, NotificationWebSocketHandler.class,
                com.synapse.util.JwtUtil.class})
@ActiveProfiles("dev")
@DisplayName("WebSocketConfig Tests")
class WebSocketConfigTest {

    @Autowired(required = false)
    private WebSocketConfigurer webSocketConfigurer;

    @Autowired(required = false)
    private NotificationWebSocketHandler notificationWebSocketHandler;

    @Autowired(required = false)
    private JwtHandshakeInterceptor jwtHandshakeInterceptor;

    @Autowired(required = false)
    private WebSocketConfig webSocketConfig;

    @Test
    @DisplayName("shouldLoadAllRequiredBeans - verify all WebSocket beans are loaded")
    void shouldLoadAllRequiredBeans() {
        assertNotNull(webSocketConfigurer, "WebSocketConfigurer bean should be loaded");
        assertNotNull(notificationWebSocketHandler, "NotificationWebSocketHandler bean should be loaded");
        assertNotNull(jwtHandshakeInterceptor, "JwtHandshakeInterceptor bean should be loaded");
        assertNotNull(webSocketConfig, "WebSocketConfig bean should be loaded");
    }

    @Test
    @DisplayName("shouldInstanceOfWebSocketConfigurer - verify config implements WebSocketConfigurer")
    void shouldInstanceOfWebSocketConfigurer() {
        assertNotNull(webSocketConfigurer, "WebSocketConfigurer should not be null");
        assertTrue(webSocketConfigurer instanceof WebSocketConfig,
            "WebSocketConfigurer should be instance of WebSocketConfig");
    }

    @Test
    @DisplayName("registerWebSocketHandlers should register handler with correct path")
    void registerWebSocketHandlers_shouldRegisterHandlerWithCorrectPath() {
        assertNotNull(webSocketConfig, "WebSocketConfig should be loaded");

        WebSocketHandlerRegistry registry = mock(WebSocketHandlerRegistry.class);
        WebSocketHandlerRegistration registration = mock(WebSocketHandlerRegistration.class);

        when(registry.addHandler(any(NotificationWebSocketHandler.class), any(String.class)))
            .thenReturn(registration);
        when(registration.addInterceptors(any(JwtHandshakeInterceptor.class)))
            .thenReturn(registration);
        when(registration.setAllowedOriginPatterns(any(String.class)))
            .thenReturn(registration);

        webSocketConfig.registerWebSocketHandlers(registry);

        verify(registry).addHandler(notificationWebSocketHandler, "/api/ws/notifications");
        verify(registration).addInterceptors(jwtHandshakeInterceptor);
        verify(registration).setAllowedOriginPatterns("*");
    }
}
