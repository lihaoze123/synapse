package com.synapse.service;

import com.synapse.dto.AuthResponse;
import com.synapse.entity.AuthProvider;
import com.synapse.entity.User;
import com.synapse.repository.UserRepository;
import com.synapse.util.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.util.Collection;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OAuth2UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private JwtUtil jwtUtil;

    private OAuth2UserService oAuth2UserService;

    @BeforeEach
    void setUp() {
        oAuth2UserService = new OAuth2UserService(userRepository, jwtUtil);
    }

    @Test
    void shouldCreateNewUserWhenEmailNotFound() {
        // Given
        OAuth2User oauth2User = createMockOAuth2User(
            "github-123",
            "githubuser",
            "github@example.com",
            "https://github.com/avatar.png",
            AuthProvider.GITHUB
        );
        when(userRepository.findByEmail("github@example.com")).thenReturn(Optional.empty());
        when(jwtUtil.generateToken(any(), any())).thenReturn("jwt-token");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        // When
        AuthResponse result = oAuth2UserService.processOAuth2User(oauth2User, AuthProvider.GITHUB);

        // Then
        assertNotNull(result);
        assertEquals("jwt-token", result.getToken());
        verify(userRepository).save(any(User.class));
    }

    @Test
    void shouldLinkToExistingLocalAccountWhenEmailMatches() {
        // Given
        User existingUser = User.builder()
            .id(1L)
            .username("localuser")
            .email("existing@example.com")
            .password("hashed")
            .provider(AuthProvider.LOCAL)
            .build();

        OAuth2User oauth2User = createMockOAuth2User(
            "google-123",
            "googleuser",
            "existing@example.com",
            "https://google.com/avatar.png",
            AuthProvider.GOOGLE
        );

        when(userRepository.findByEmail("existing@example.com")).thenReturn(Optional.of(existingUser));
        when(jwtUtil.generateToken(1L, "localuser")).thenReturn("jwt-token");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        // When
        AuthResponse result = oAuth2UserService.processOAuth2User(oauth2User, AuthProvider.GOOGLE);

        // Then
        assertNotNull(result);
        assertEquals("jwt-token", result.getToken());
        verify(userRepository).save(argThat(u ->
            u.getProvider() == AuthProvider.GOOGLE && u.getProviderId().equals("google-123")
        ));
    }

    @Test
    void shouldLoginExistingOAuthUserWhenProviderMatches() {
        // Given
        User existingUser = User.builder()
            .id(1L)
            .username("githubuser")
            .email("github@example.com")
            .provider(AuthProvider.GITHUB)
            .providerId("github-123")
            .build();

        OAuth2User oauth2User = createMockOAuth2User(
            "github-123",
            "githubuser",
            "github@example.com",
            "https://github.com/avatar.png",
            AuthProvider.GITHUB
        );

        when(userRepository.findByEmail("github@example.com")).thenReturn(Optional.of(existingUser));
        when(jwtUtil.generateToken(1L, "githubuser")).thenReturn("jwt-token");

        // When
        AuthResponse result = oAuth2UserService.processOAuth2User(oauth2User, AuthProvider.GITHUB);

        // Then
        assertNotNull(result);
        assertEquals("jwt-token", result.getToken());
        verify(userRepository, never()).save(any());
    }

    @Test
    void shouldThrowExceptionWhenProviderConflict() {
        // Given
        User existingUser = User.builder()
            .id(1L)
            .username("githubuser")
            .email("existing@example.com")
            .provider(AuthProvider.GITHUB)
            .providerId("github-123")
            .build();

        OAuth2User oauth2User = createMockOAuth2User(
            "google-123",
            "googleuser",
            "existing@example.com",
            "https://google.com/avatar.png",
            AuthProvider.GOOGLE
        );

        when(userRepository.findByEmail("existing@example.com")).thenReturn(Optional.of(existingUser));

        // When & Then
        assertThrows(IllegalArgumentException.class, () ->
            oAuth2UserService.processOAuth2User(oauth2User, AuthProvider.GOOGLE)
        );
    }

    private OAuth2User createMockOAuth2User(String id, String login, String email,
                                             String avatarUrl, AuthProvider provider) {
        return new OAuth2User() {
            private final Map<String, Object> attributes = new HashMap<>();

            {
                if (provider == AuthProvider.GITHUB) {
                    attributes.put("id", id);
                    attributes.put("login", login);
                    attributes.put("email", email);
                    attributes.put("avatar_url", avatarUrl);
                } else {
                    attributes.put("sub", id);
                    attributes.put("name", login);
                    attributes.put("email", email);
                    attributes.put("picture", avatarUrl);
                }
            }

            @Override
            public Map<String, Object> getAttributes() {
                return attributes;
            }

            @Override
            public Collection<? extends GrantedAuthority> getAuthorities() {
                return Collections.singletonList(new SimpleGrantedAuthority("USER"));
            }

            @Override
            public String getName() {
                return login;
            }
        };
    }
}
