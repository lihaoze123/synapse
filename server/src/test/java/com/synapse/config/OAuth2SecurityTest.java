package com.synapse.config;

import com.synapse.entity.AuthProvider;
import com.synapse.entity.User;
import com.synapse.repository.UserRepository;
import com.synapse.util.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.test.context.ActiveProfiles;

import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

/**
 * Red Team Security Tests for OAuth2 Flow.
 * These tests verify that the OAuth2 implementation is secure against common attacks.
 */
@SpringBootTest
@ActiveProfiles("test")
class OAuth2SecurityTest {

    @Autowired(required = false)
    private OAuth2AuthenticationSuccessHandler successHandler;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    private User testUser;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
        testUser = User.builder()
            .id(1L)
            .username("testuser")
            .email("test@example.com")
            .password("hashed")
            .provider(AuthProvider.GITHUB)
            .providerId("github-123")
            .build();
        testUser = userRepository.save(testUser);
    }

    /**
     * RED TEAM TEST: CSRF State Parameter Bypass
     * Attack: Attacker tries to complete OAuth flow without valid state cookie.
     * Expected: Request should be rejected with error redirect.
     */
    @Test
    void shouldRejectOAuthCallbackWithoutValidStateCookie() throws Exception {
        if (successHandler == null) {
            return;
        }

        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();

        request.setParameter("state", "attacker-crafted-state");
        request.setScheme("https");
        request.setServerName("localhost");

        org.springframework.security.core.Authentication authentication =
            mock(org.springframework.security.core.Authentication.class);
        OAuth2User oauth2User = createMockOAuth2User("github-123", "testuser", "test@example.com");
        when(authentication.getPrincipal()).thenReturn(oauth2User);
        when(authentication.getName()).thenReturn("testuser");

        successHandler.onAuthenticationSuccess(request, response, authentication);

        String redirectedUrl = response.getRedirectedUrl();
        assertTrue(
            redirectedUrl != null && redirectedUrl.contains("error"),
            "OAuth callback without valid state cookie should redirect with error"
        );
    }

    /**
     * RED TEAM TEST: State Parameter Mismatch
     * Attack: Attacker provides state parameter that doesn't match cookie.
     * Expected: Request should be rejected.
     */
    @Test
    void shouldRejectOAuthCallbackWithMismatchedState() throws Exception {
        if (successHandler == null) {
            return;
        }

        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();

        request.setParameter("state", "attacker-state");
        request.setCookies(new jakarta.servlet.http.Cookie("oauth_state", "legitimate-state"));
        request.setScheme("https");

        org.springframework.security.core.Authentication authentication =
            mock(org.springframework.security.core.Authentication.class);
        OAuth2User oauth2User = createMockOAuth2User("github-123", "testuser", "test@example.com");
        when(authentication.getPrincipal()).thenReturn(oauth2User);
        when(authentication.getName()).thenReturn("testuser");

        successHandler.onAuthenticationSuccess(request, response, authentication);

        String redirectedUrl = response.getRedirectedUrl();
        assertTrue(
            redirectedUrl != null && redirectedUrl.contains("error"),
            "OAuth callback with mismatched state should redirect with error"
        );
    }

    /**
     * RED TEAM TEST: Missing State Parameter
     * Attack: Attacker tries to complete OAuth without any state parameter.
     * Expected: Request should be rejected.
     */
    @Test
    void shouldRejectOAuthCallbackWithoutStateParameter() throws Exception {
        if (successHandler == null) {
            return;
        }

        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();

        request.setCookies(new jakarta.servlet.http.Cookie("oauth_state", "some-state"));
        request.setScheme("https");

        org.springframework.security.core.Authentication authentication =
            mock(org.springframework.security.core.Authentication.class);
        OAuth2User oauth2User = createMockOAuth2User("github-123", "testuser", "test@example.com");
        when(authentication.getPrincipal()).thenReturn(oauth2User);
        when(authentication.getName()).thenReturn("testuser");

        successHandler.onAuthenticationSuccess(request, response, authentication);

        String redirectedUrl = response.getRedirectedUrl();
        assertTrue(
            redirectedUrl != null && redirectedUrl.contains("error"),
            "OAuth callback without state parameter should redirect with error"
        );
    }

    private OAuth2User createMockOAuth2User(String id, String login, String email) {
        return new OAuth2User() {
            private final Map<String, Object> attributes = new HashMap<>();

            {
                attributes.put("id", id);
                attributes.put("login", login);
                attributes.put("email", email);
                attributes.put("avatar_url", "https://example.com/avatar.png");
            }

            @Override
            public Map<String, Object> getAttributes() {
                return attributes;
            }

            @Override
            public java.util.Collection<? extends org.springframework.security.core.GrantedAuthority> getAuthorities() {
                return java.util.Collections.emptyList();
            }

            @Override
            public String getName() {
                return login;
            }
        };
    }
}
