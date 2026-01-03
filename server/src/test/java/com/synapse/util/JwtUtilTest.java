package com.synapse.util;

import io.jsonwebtoken.Claims;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
@ActiveProfiles("dev")
@DisplayName("JwtUtil Tests")
class JwtUtilTest {

    @Autowired
    private JwtUtil jwtUtil;

    @Test
    @DisplayName("generateToken should create valid token with userId and username")
    void generateToken_shouldCreateValidToken() {
        String token = jwtUtil.generateToken(123L, "testuser");

        assertNotNull(token);
        assertFalse(token.isEmpty());
    }

    @Test
    @DisplayName("parseToken should extract correct claims from valid token")
    void parseToken_shouldExtractCorrectClaims() {
        Long expectedUserId = 456L;
        String expectedUsername = "john_doe";

        String token = jwtUtil.generateToken(expectedUserId, expectedUsername);
        Claims claims = jwtUtil.parseToken(token);

        assertEquals(expectedUsername, claims.getSubject());
        assertEquals(expectedUserId, claims.get("userId", Long.class));
        assertNotNull(claims.getIssuedAt());
        assertNotNull(claims.getExpiration());
    }

    @Test
    @DisplayName("validateToken should return true for valid token")
    void validateToken_shouldReturnTrueForValidToken() {
        String token = jwtUtil.generateToken(789L, "alice");

        assertTrue(jwtUtil.validateToken(token));
    }

    @Test
    @DisplayName("validateToken should return false for invalid token")
    void validateToken_shouldReturnFalseForInvalidToken() {
        assertFalse(jwtUtil.validateToken("invalid.token.here"));
    }

    @Test
    @DisplayName("validateToken should return false for null token")
    void validateToken_shouldReturnFalseForNullToken() {
        assertFalse(jwtUtil.validateToken(null));
    }

    @Test
    @DisplayName("validateToken should return false for empty token")
    void validateToken_shouldReturnFalseForEmptyToken() {
        assertFalse(jwtUtil.validateToken(""));
    }

    @Test
    @DisplayName("validateToken should return false for malformed token")
    void validateToken_shouldReturnFalseForMalformedToken() {
        assertFalse(jwtUtil.validateToken("not-a-jwt"));
    }

    @Test
    @DisplayName("getUsernameFromToken should extract username correctly")
    void getUsernameFromToken_shouldExtractUsername() {
        String expectedUsername = "bob_tester";
        String token = jwtUtil.generateToken(100L, expectedUsername);

        String actualUsername = jwtUtil.getUsernameFromToken(token);

        assertEquals(expectedUsername, actualUsername);
    }

    @Test
    @DisplayName("getUserIdFromToken should extract userId correctly")
    void getUserIdFromToken_shouldExtractUserId() {
        Long expectedUserId = 999L;
        String token = jwtUtil.generateToken(expectedUserId, "user999");

        Long actualUserId = jwtUtil.getUserIdFromToken(token);

        assertEquals(expectedUserId, actualUserId);
    }

    @Test
    @DisplayName("generated token should have expiration time")
    void generatedToken_shouldHaveExpiration() {
        String token = jwtUtil.generateToken(1L, "user");
        Claims claims = jwtUtil.parseToken(token);

        assertNotNull(claims.getExpiration());
        assertTrue(claims.getExpiration().after(claims.getIssuedAt()));
    }

    @Test
    @DisplayName("generateToken should handle special characters in username")
    void generateToken_shouldHandleSpecialCharacters() {
        String usernameWithSpecialChars = "user_123.test";
        String token = jwtUtil.generateToken(1L, usernameWithSpecialChars);

        assertEquals(usernameWithSpecialChars, jwtUtil.getUsernameFromToken(token));
    }

    @Test
    @DisplayName("getUserIdFromToken should handle large userId values")
    void getUserIdFromToken_shouldHandleLargeUserId() {
        Long largeUserId = Long.MAX_VALUE;
        String token = jwtUtil.generateToken(largeUserId, "biguser");

        assertEquals(largeUserId, jwtUtil.getUserIdFromToken(token));
    }

    @Test
    @DisplayName("parseToken should throw exception for expired token")
    void parseToken_shouldThrowForExpiredToken() {
        String token = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ0ZXN0IiwidXNlcklkIjoxLCJpYXQiOjE2MDAwMDAwMDAsImV4cCI6MTYwMDAwMDAwMX0.abc";

        assertFalse(jwtUtil.validateToken(token));
    }

    @Test
    @DisplayName("validateToken should return false for tampered token")
    void validateToken_shouldReturnFalseForTamperedToken() {
        String validToken = jwtUtil.generateToken(1L, "user");
        String tamperedToken = validToken.substring(0, validToken.length() - 5) + "AAAAA";

        assertFalse(jwtUtil.validateToken(tamperedToken));
    }

    @Test
    @DisplayName("getUserIdFromToken should extract zero userId")
    void getUserIdFromToken_shouldExtractZeroUserId() {
        Long zeroUserId = 0L;
        String token = jwtUtil.generateToken(zeroUserId, "zerouser");

        assertEquals(zeroUserId, jwtUtil.getUserIdFromToken(token));
    }
}
