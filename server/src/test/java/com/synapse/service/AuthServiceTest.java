package com.synapse.service;

import com.synapse.dto.AuthResponse;
import com.synapse.dto.LoginRequest;
import com.synapse.dto.RegisterRequest;
import com.synapse.dto.UserDto;
import com.synapse.entity.User;
import com.synapse.repository.UserRepository;
import com.synapse.util.JwtUtil;
import com.synapse.util.PasswordUtil;
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
        String rawPassword = "password123";
        String hashedPassword = PasswordUtil.encode(rawPassword);
        RegisterRequest request = new RegisterRequest();
        request.setUsername("testuser");
        request.setEmail("testuser@example.com");
        request.setPassword(rawPassword);
        User savedUser = User.builder()
                .id(1L)
                .username("testuser")
                .email("testuser@example.com")
                .password(hashedPassword)
                .build();

        when(userRepository.existsByUsername("testuser")).thenReturn(false);
        when(userRepository.existsByEmail("testuser@example.com")).thenReturn(false);
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
        String rawPassword = "password123";
        String hashedPassword = PasswordUtil.encode(rawPassword);
        LoginRequest request = new LoginRequest("testuser", rawPassword);
        User user = User.builder()
                .id(1L)
                .username("testuser")
                .password(hashedPassword)
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
        String correctPassword = "correctpassword";
        String hashedPassword = PasswordUtil.encode(correctPassword);
        LoginRequest request = new LoginRequest("testuser", "wrongpassword");
        User user = User.builder()
                .id(1L)
                .username("testuser")
                .password(hashedPassword)
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
        String rawPassword = "password123";
        String hashedPassword = PasswordUtil.encode(rawPassword);
        RegisterRequest request = new RegisterRequest();
        request.setUsername("testuser");
        request.setEmail("testuser@example.com");
        request.setPassword(rawPassword);
        request.setAvatarUrl("custom-avatar.jpg");
        User savedUser = User.builder()
                .id(1L)
                .username("testuser")
                .email("testuser@example.com")
                .password(hashedPassword)
                .avatarUrl("custom-avatar.jpg")
                .build();

        when(userRepository.existsByUsername("testuser")).thenReturn(false);
        when(userRepository.existsByEmail("testuser@example.com")).thenReturn(false);
        when(userRepository.save(any(User.class))).thenReturn(savedUser);
        when(jwtUtil.generateToken(1L, "testuser")).thenReturn("test-jwt-token");

        AuthResponse response = authService.register(request);

        assertNotNull(response);
        assertEquals("custom-avatar.jpg", response.getUser().getAvatarUrl());
    }

    @Test
    @DisplayName("login should migrate plaintext password and allow login")
    void login_shouldMigratePlaintextPassword() {
        String rawPassword = "password123";
        LoginRequest request = new LoginRequest("testuser", rawPassword);
        User userWithPlaintextPwd = User.builder()
                .id(1L)
                .username("testuser")
                .password(rawPassword)
                .build();

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(userWithPlaintextPwd));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(jwtUtil.generateToken(1L, "testuser")).thenReturn("test-jwt-token");

        AuthResponse response = authService.login(request);

        assertNotNull(response);
        assertEquals("test-jwt-token", response.getToken());
        verify(userRepository).save(any(User.class));
    }

    @Test
    @DisplayName("login should reject wrong password even with plaintext user")
    void login_shouldRejectWrongPasswordForPlaintextUser() {
        String storedPassword = "correctpassword";
        LoginRequest request = new LoginRequest("testuser", "wrongpassword");
        User userWithPlaintextPwd = User.builder()
                .id(1L)
                .username("testuser")
                .password(storedPassword)
                .build();

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(userWithPlaintextPwd));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> authService.login(request));
        assertEquals("Invalid username or password", ex.getMessage());
    }
}
