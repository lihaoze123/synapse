package com.synapse.websocket;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.synapse.util.JwtUtil;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpHeaders;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.web.socket.WebSocketHandler;

@ExtendWith(MockitoExtension.class)
@DisplayName("JwtHandshakeInterceptor Tests")
class JwtHandshakeInterceptorTest {

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private ServerHttpResponse response;

    @Mock
    private WebSocketHandler wsHandler;

    @Mock
    private ServletServerHttpRequest servletRequest;

    @Mock
    private HttpServletRequest httpServletRequest;

    private JwtHandshakeInterceptor interceptor;
    private Map<String, Object> attributes;

    @BeforeEach
    void setUp() {
        interceptor = new JwtHandshakeInterceptor(jwtUtil);
        attributes = new HashMap<>();

        lenient().when(servletRequest.getHeaders()).thenReturn(HttpHeaders.EMPTY);
    }

    @Test
    @DisplayName("beforeHandshake should succeed with valid token from query param")
    void beforeHandshake_shouldSucceedWithValidTokenFromQueryParam() {
        Long expectedUserId = 123L;
        String validToken = "valid.jwt.token";

        when(servletRequest.getServletRequest()).thenReturn(httpServletRequest);
        when(httpServletRequest.getQueryString()).thenReturn("token=" + validToken);

        Claims mockClaims = io.jsonwebtoken.Jwts.claims()
            .add("userId", expectedUserId)
            .build();

        when(jwtUtil.validateToken(validToken)).thenReturn(true);
        when(jwtUtil.parseToken(validToken)).thenReturn(mockClaims);

        boolean result = interceptor.beforeHandshake(servletRequest, response, wsHandler, attributes);

        assertTrue(result, "Handshake should succeed with valid token");
        assertEquals(expectedUserId, attributes.get("userId"), "UserId should be extracted and added to attributes");

        verify(jwtUtil).validateToken(validToken);
        verify(jwtUtil).parseToken(validToken);
    }

    @Test
    @DisplayName("beforeHandshake should fail with invalid token from query param")
    void beforeHandshake_shouldFailWithInvalidTokenFromQueryParam() {
        String invalidToken = "invalid.jwt.token";

        when(servletRequest.getServletRequest()).thenReturn(httpServletRequest);
        when(httpServletRequest.getQueryString()).thenReturn("token=" + invalidToken);

        when(jwtUtil.validateToken(invalidToken)).thenReturn(false);

        boolean result = interceptor.beforeHandshake(servletRequest, response, wsHandler, attributes);

        assertFalse(result, "Handshake should fail with invalid token");
        assertTrue(attributes.isEmpty(), "Attributes should be empty when token is invalid");

        verify(jwtUtil).validateToken(invalidToken);
    }

    @Test
    @DisplayName("beforeHandshake should fail with null userId in claims")
    void beforeHandshake_shouldFailWithNullUserIdInClaims() {
        String validToken = "valid.jwt.token";

        when(servletRequest.getServletRequest()).thenReturn(httpServletRequest);
        when(httpServletRequest.getQueryString()).thenReturn("token=" + validToken);

        Claims mockClaims = io.jsonwebtoken.Jwts.claims()
            .add("userId", (Object) null)
            .build();

        when(jwtUtil.validateToken(validToken)).thenReturn(true);
        when(jwtUtil.parseToken(validToken)).thenReturn(mockClaims);

        boolean result = interceptor.beforeHandshake(servletRequest, response, wsHandler, attributes);

        assertFalse(result, "Handshake should fail when userId is null in claims");
    }

    @Test
    @DisplayName("beforeHandshake should fail with no token provided")
    void beforeHandshake_shouldFailWithNoTokenProvided() {
        when(servletRequest.getServletRequest()).thenReturn(httpServletRequest);
        when(httpServletRequest.getQueryString()).thenReturn(null);

        boolean result = interceptor.beforeHandshake(servletRequest, response, wsHandler, attributes);

        assertFalse(result, "Handshake should fail when no token is provided");
    }

    @Test
    @DisplayName("beforeHandshake should succeed with URL encoded token from query param")
    void beforeHandshake_shouldSucceedWithUrlEncodedToken() {
        Long expectedUserId = 456L;
        String tokenWithSpecialChars = "valid.jwt.token with=equals&and&ampersand";

        when(servletRequest.getServletRequest()).thenReturn(httpServletRequest);
        when(httpServletRequest.getQueryString()).thenReturn(
                "other=value&token="
                        + java.net.URLEncoder.encode(
                                tokenWithSpecialChars,
                                java.nio.charset.StandardCharsets.UTF_8));

        Claims mockClaims = io.jsonwebtoken.Jwts.claims()
            .add("userId", expectedUserId)
            .build();

        when(jwtUtil.validateToken(tokenWithSpecialChars)).thenReturn(true);
        when(jwtUtil.parseToken(tokenWithSpecialChars)).thenReturn(mockClaims);

        boolean result = interceptor.beforeHandshake(servletRequest, response, wsHandler, attributes);

        assertTrue(result, "Handshake should succeed with URL encoded token");
        assertEquals(expectedUserId, attributes.get("userId"), "UserId should be extracted from URL encoded token");
    }

    @Test
    @DisplayName("beforeHandshake should succeed with Bearer token from Authorization header")
    void beforeHandshake_shouldSucceedWithBearerTokenFromHeader() {
        Long expectedUserId = 789L;
        String validToken = "bearer.jwt.token";

        when(servletRequest.getServletRequest()).thenReturn(httpServletRequest);
        when(httpServletRequest.getQueryString()).thenReturn(null);
        when(servletRequest.getHeaders()).thenReturn(HttpHeaders.readOnlyHttpHeaders(
            new org.springframework.util.LinkedMultiValueMap<>() {{
                add(HttpHeaders.AUTHORIZATION, "Bearer " + validToken);
            }}
        ));

        Claims mockClaims = io.jsonwebtoken.Jwts.claims()
            .add("userId", expectedUserId)
            .build();

        when(jwtUtil.validateToken(validToken)).thenReturn(true);
        when(jwtUtil.parseToken(validToken)).thenReturn(mockClaims);

        boolean result = interceptor.beforeHandshake(servletRequest, response, wsHandler, attributes);

        assertTrue(result, "Handshake should succeed with Bearer token from Authorization header");
        assertEquals(expectedUserId, attributes.get("userId"), "UserId should be extracted from Bearer token");
    }

    @Test
    @DisplayName("beforeHandshake should prioritize query param token over Authorization header")
    void beforeHandshake_shouldPrioritizeQueryParamOverHeader() {
        Long expectedUserId = 999L;
        String queryToken = "query.token";
        String headerToken = "header.token";

        when(servletRequest.getServletRequest()).thenReturn(httpServletRequest);
        when(httpServletRequest.getQueryString()).thenReturn("token=" + queryToken);
        lenient().when(servletRequest.getHeaders()).thenReturn(HttpHeaders.readOnlyHttpHeaders(
            new org.springframework.util.LinkedMultiValueMap<>() {{
                add(HttpHeaders.AUTHORIZATION, "Bearer " + headerToken);
            }}
        ));

        Claims mockClaims = io.jsonwebtoken.Jwts.claims()
            .add("userId", expectedUserId)
            .build();

        when(jwtUtil.validateToken(queryToken)).thenReturn(true);
        when(jwtUtil.parseToken(queryToken)).thenReturn(mockClaims);

        boolean result = interceptor.beforeHandshake(servletRequest, response, wsHandler, attributes);

        assertTrue(result, "Handshake should succeed");
        assertEquals(expectedUserId, attributes.get("userId"), "UserId should be from query param, not header");
        verify(jwtUtil).validateToken(queryToken);
    }

    @Test
    @DisplayName("beforeHandshake should handle token not being first query param")
    void beforeHandshake_shouldHandleTokenNotFirstQueryParam() {
        Long expectedUserId = 111L;
        String validToken = "valid.token";

        when(servletRequest.getServletRequest()).thenReturn(httpServletRequest);
        when(httpServletRequest.getQueryString()).thenReturn("other=value&token=" + validToken + "&another=param");

        Claims mockClaims = io.jsonwebtoken.Jwts.claims()
            .add("userId", expectedUserId)
            .build();

        when(jwtUtil.validateToken(validToken)).thenReturn(true);
        when(jwtUtil.parseToken(validToken)).thenReturn(mockClaims);

        boolean result = interceptor.beforeHandshake(servletRequest, response, wsHandler, attributes);

        assertTrue(result, "Handshake should succeed when token is not first param");
        assertEquals(expectedUserId, attributes.get("userId"), "UserId should be extracted");
    }

    @Test
    @DisplayName("beforeHandshake should handle Authorization header without Bearer prefix")
    void beforeHandshake_shouldHandleAuthHeaderWithoutBearerPrefix() {
        when(servletRequest.getServletRequest()).thenReturn(httpServletRequest);
        when(httpServletRequest.getQueryString()).thenReturn(null);
        when(servletRequest.getHeaders()).thenReturn(HttpHeaders.readOnlyHttpHeaders(
            new org.springframework.util.LinkedMultiValueMap<>() {{
                add(HttpHeaders.AUTHORIZATION, "InvalidFormat token");
            }}
        ));

        boolean result = interceptor.beforeHandshake(servletRequest, response, wsHandler, attributes);

        assertFalse(result, "Handshake should fail with invalid Authorization header format");
    }

    @Test
    @DisplayName("beforeHandshake should handle exception during token validation")
    void beforeHandshake_shouldHandleExceptionDuringValidation() {
        String invalidToken = "malformed.token";

        when(servletRequest.getServletRequest()).thenReturn(httpServletRequest);
        when(httpServletRequest.getQueryString()).thenReturn("token=" + invalidToken);

        when(jwtUtil.validateToken(invalidToken)).thenThrow(new RuntimeException("Token parsing error"));

        boolean result = interceptor.beforeHandshake(servletRequest, response, wsHandler, attributes);

        assertFalse(result, "Handshake should fail when exception occurs during validation");
    }

    @Test
    @DisplayName("beforeHandshake should handle empty query string")
    void beforeHandshake_shouldHandleEmptyQueryString() {
        when(servletRequest.getServletRequest()).thenReturn(httpServletRequest);
        when(httpServletRequest.getQueryString()).thenReturn("");

        boolean result = interceptor.beforeHandshake(servletRequest, response, wsHandler, attributes);

        assertFalse(result, "Handshake should fail with empty query string and no header");
    }

    @Test
    @DisplayName("afterHandshake should complete without error")
    void afterHandshake_shouldCompleteWithoutError() {
        interceptor.afterHandshake(servletRequest, response, wsHandler, null);

        assertTrue(true, "afterHandshake should complete without exception");
    }
}
