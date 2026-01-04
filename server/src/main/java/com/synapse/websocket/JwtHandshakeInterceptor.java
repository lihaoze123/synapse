package com.synapse.websocket;

import com.synapse.util.JwtUtil;
import io.jsonwebtoken.Claims;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtHandshakeInterceptor implements HandshakeInterceptor {

    private final JwtUtil jwtUtil;

    @Override
    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                   WebSocketHandler wsHandler, Map<String, Object> attributes) {
        try {
            String token = null;
            // Try query param first: ?token=...
            if (request instanceof ServletServerHttpRequest servletRequest) {
                String q = servletRequest.getServletRequest().getQueryString();
                if (q != null) {
                    for (String part : q.split("&")) {
                        int idx = part.indexOf('=');
                        if (idx > 0) {
                            String k = part.substring(0, idx);
                            String v = part.substring(idx + 1);
                            if ("token".equals(k)) {
                                token = java.net.URLDecoder.decode(v, java.nio.charset.StandardCharsets.UTF_8);
                                break;
                            }
                        }
                    }
                }
            }
            // Fallback: Authorization header if present (non-standard for browsers)
            if (token == null) {
                String auth = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
                if (auth != null && auth.startsWith("Bearer ")) {
                    token = auth.substring(7);
                }
            }

            if (token == null || !jwtUtil.validateToken(token)) {
                return false;
            }
            Claims claims = jwtUtil.parseToken(token);
            Long userId = claims.get("userId", Long.class);
            if (userId == null) {
                return false;
            }
            attributes.put("userId", userId);
            return true;
        } catch (Exception e) {
            log.warn("WebSocket handshake failed: {}", e.getMessage());
            return false;
        }
    }

    @Override
    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response,
                               WebSocketHandler wsHandler, Exception exception) {
        // no-op
    }
}

