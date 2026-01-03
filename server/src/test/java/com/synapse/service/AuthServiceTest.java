package com.synapse.service;

import com.synapse.dto.AuthResponse;
import com.synapse.dto.LoginRequest;
import com.synapse.dto.RegisterRequest;
import com.synapse.dto.UserDto;
import com.synapse.entity.User;
import com.synapse.repository.UserRepository;
import com.synapse.util.JwtUtil;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("AuthService Tests")
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private JwtUtil jwtUtil;

    @InjectMocks
    private AuthService authService;

    @Test
    @DisplayName("register should create new user and return auth response")
    void register_shouldCreateNewUser() {
        RegisterRequest request = new RegisterRequest("testuser", "password123", null);
        User savedUser = User.builder()
                .id(1L)
                .username("testuser")
                .password("password123")
                .build();

        when(userRepository.existsByUsername("testuser")).thenReturn(false);
        when(userRepository.save(any(User.class))).thenReturn(savedUser);
        when(jwtUtil.generateToken(1L, "testuser")).thenReturn("test-jwt-token");

        AuthResponse response = authService.register(request);

        assertNotNull(response);
        assertEquals("test-jwt-token", response.getToken());
        assertEquals("testuser", response.getUser().getUsername());
        verify(userRepository).save(any(User.class));
        verify(jwtUtil).generateToken(1L, "testuser");
    }

    @Test
    @DisplayName("register should throw exception when username already exists")
    void register_shouldThrowWhenUsernameExists() {
        RegisterRequest request = new RegisterRequest("existinguser", "password123", null);

        when(userRepository.existsByUsername("existinguser")).thenReturn(true);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> authService.register(request));
        assertEquals("Username already exists", ex.getMessage());
        verify(userRepository, times(0)).save(any(User.class));
    }

    @Test
    @DisplayName("login should return auth response for valid credentials")
    void login_shouldReturnAuthResponseForValidCredentials() {
        LoginRequest request = new LoginRequest("testuser", "password123");
        User user = User.builder()
                .id(1L)
                .username("testuser")
                .password("password123")
                .build();

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(jwtUtil.generateToken(1L, "testuser")).thenReturn("test-jwt-token");

        AuthResponse response = authService.login(request);

        assertNotNull(response);
        assertEquals("test-jwt-token", response.getToken());
        assertEquals("testuser", response.getUser().getUsername());
    }

    @Test
    @DisplayName("login should throw exception for non-existent user")
    void login_shouldThrowForNonExistentUser() {
        LoginRequest request = new LoginRequest("nonexistent", "password123");

        when(userRepository.findByUsername("nonexistent")).thenReturn(Optional.empty());

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> authService.login(request));
        assertEquals("Invalid username or password", ex.getMessage());
    }

    @Test
    @DisplayName("login should throw exception for incorrect password")
    void login_shouldThrowForIncorrectPassword() {
        LoginRequest request = new LoginRequest("testuser", "wrongpassword");
        User user = User.builder()
                .id(1L)
                .username("testuser")
                .password("correctpassword")
                .build();

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> authService.login(request));
        assertEquals("Invalid username or password", ex.getMessage());
    }

    @Test
    @DisplayName("getCurrentUser should return user dto for valid userId")
    void getCurrentUser_shouldReturnUserDto() {
        User user = User.builder()
                .id(1L)
                .username("testuser")
                .password("password123")
                .avatarUrl("avatar.jpg")
                .displayName("Test User")
                .build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        UserDto response = authService.getCurrentUser(1L);

        assertNotNull(response);
        assertEquals("testuser", response.getUsername());
        assertEquals("avatar.jpg", response.getAvatarUrl());
        assertEquals("Test User", response.getDisplayName());
    }

    @Test
    @DisplayName("getCurrentUser should throw exception for non-existent userId")
    void getCurrentUser_shouldThrowForNonExistentUserId() {
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> authService.getCurrentUser(999L));
        assertEquals("User not found", ex.getMessage());
    }

    @Test
    @DisplayName("register should handle avatar url in request")
    void register_shouldHandleAvatarUrl() {
        RegisterRequest request = new RegisterRequest("testuser", "password123", "custom-avatar.jpg");
        User savedUser = User.builder()
                .id(1L)
                .username("testuser")
                .password("password123")
                .avatarUrl("custom-avatar.jpg")
                .build();

        when(userRepository.existsByUsername("testuser")).thenReturn(false);
        when(userRepository.save(any(User.class))).thenReturn(savedUser);
        when(jwtUtil.generateToken(1L, "testuser")).thenReturn("test-jwt-token");

        AuthResponse response = authService.register(request);

        assertNotNull(response);
        assertEquals("custom-avatar.jpg", response.getUser().getAvatarUrl());
    }
}
