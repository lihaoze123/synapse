package com.synapse.entity;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class UserTest {
    @Test
    void shouldSupportOAuthFields() {
        User user = User.builder()
            .id(1L)
            .username("testuser")
            .password("hashed_password")
            .email("test@example.com")
            .provider(AuthProvider.LOCAL)
            .providerId("local-123")
            .avatarUrl("https://example.com/avatar.png")
            .displayName("Test User")
            .bio("Test bio")
            .build();

        assertEquals("test@example.com", user.getEmail());
        assertEquals(AuthProvider.LOCAL, user.getProvider());
        assertEquals("local-123", user.getProviderId());
    }
}
