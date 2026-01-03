package com.synapse.service;

import com.synapse.dto.PostDto;
import com.synapse.dto.UpdateProfileRequest;
import com.synapse.dto.UserDto;
import com.synapse.entity.Post;
import com.synapse.entity.PostType;
import com.synapse.entity.User;
import com.synapse.repository.PostRepository;
import com.synapse.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("UserService Tests")
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PostRepository postRepository;

    @InjectMocks
    private UserService userService;

    @Test
    @DisplayName("getUser should return user dto for valid id")
    void getUser_shouldReturnUserDto() {
        User user = User.builder()
                .id(1L)
                .username("testuser")
                .displayName("Test User")
                .bio("Test bio")
                .avatarUrl("avatar.jpg")
                .build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        UserDto result = userService.getUser(1L);

        assertNotNull(result);
        assertEquals("testuser", result.getUsername());
        assertEquals("Test User", result.getDisplayName());
        assertEquals("Test bio", result.getBio());
        assertEquals("avatar.jpg", result.getAvatarUrl());
    }

    @Test
    @DisplayName("getUser should throw exception for non-existent id")
    void getUser_shouldThrowForNonExistentId() {
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> userService.getUser(999L));
        assertEquals("User not found", ex.getMessage());
    }

    @Test
    @DisplayName("getUserByUsername should return user dto")
    void getUserByUsername_shouldReturnUserDto() {
        User user = User.builder()
                .id(1L)
                .username("testuser")
                .displayName("Test User")
                .build();

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));

        UserDto result = userService.getUserByUsername("testuser");

        assertNotNull(result);
        assertEquals("testuser", result.getUsername());
    }

    @Test
    @DisplayName("getUserByUsername should throw exception for non-existent username")
    void getUserByUsername_shouldThrowForNonExistentUsername() {
        when(userRepository.findByUsername("nonexistent")).thenReturn(Optional.empty());

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> userService.getUserByUsername("nonexistent"));
        assertEquals("User not found", ex.getMessage());
    }

    @Test
    @DisplayName("getUserPosts should return paginated posts")
    void getUserPosts_shouldReturnPaginatedPosts() {
        User user = User.builder()
                .id(1L)
                .username("testuser")
                .build();
        Post post1 = Post.builder()
                .id(1L)
                .type(PostType.ARTICLE)
                .title("Test Post 1")
                .content("Content 1")
                .user(user)
                .build();
        Post post2 = Post.builder()
                .id(2L)
                .type(PostType.SNIPPET)
                .title("Test Post 2")
                .content("Content 2")
                .user(user)
                .build();

        when(userRepository.existsById(1L)).thenReturn(true);
        Pageable pageable = PageRequest.of(0, 10);
        when(postRepository.findByUserIdOrderByCreatedAtDesc(1L, pageable))
                .thenReturn(new PageImpl<>(List.of(post1, post2)));

        Page<PostDto> result = userService.getUserPosts(1L, pageable);

        assertNotNull(result);
        assertEquals(2, result.getContent().size());
        assertEquals("Test Post 1", result.getContent().get(0).getTitle());
    }

    @Test
    @DisplayName("getUserPosts should throw exception for non-existent user")
    void getUserPosts_shouldThrowForNonExistentUser() {
        when(userRepository.existsById(999L)).thenReturn(false);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> userService.getUserPosts(999L, PageRequest.of(0, 10)));
        assertEquals("User not found", ex.getMessage());
    }

    @Test
    @DisplayName("updateProfile should update display name")
    void updateProfile_shouldUpdateDisplayName() {
        User user = User.builder()
                .id(1L)
                .username("testuser")
                .displayName("Old Name")
                .build();
        UpdateProfileRequest request = new UpdateProfileRequest("New Name", null, null);

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenReturn(user);

        UserDto result = userService.updateProfile(1L, request);

        assertNotNull(result);
        assertEquals("New Name", result.getDisplayName());
        verify(userRepository).save(user);
    }

    @Test
    @DisplayName("updateProfile should update bio")
    void updateProfile_shouldUpdateBio() {
        User user = User.builder()
                .id(1L)
                .username("testuser")
                .bio("Old bio")
                .build();
        UpdateProfileRequest request = new UpdateProfileRequest(null, "New bio", null);

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenReturn(user);

        UserDto result = userService.updateProfile(1L, request);

        assertNotNull(result);
        assertEquals("New bio", result.getBio());
    }

    @Test
    @DisplayName("updateProfile should update avatar url")
    void updateProfile_shouldUpdateAvatarUrl() {
        User user = User.builder()
                .id(1L)
                .username("testuser")
                .avatarUrl("old-avatar.jpg")
                .build();
        UpdateProfileRequest request = new UpdateProfileRequest(null, null, "new-avatar.jpg");

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenReturn(user);

        UserDto result = userService.updateProfile(1L, request);

        assertNotNull(result);
        assertEquals("new-avatar.jpg", result.getAvatarUrl());
    }

    @Test
    @DisplayName("updateProfile should throw exception for non-existent user")
    void updateProfile_shouldThrowForNonExistentUser() {
        UpdateProfileRequest request = new UpdateProfileRequest("Name", null, null);

        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> userService.updateProfile(999L, request));
        assertEquals("User not found", ex.getMessage());
    }

    @Test
    @DisplayName("updateProfile should update all fields together")
    void updateProfile_shouldUpdateAllFields() {
        User user = User.builder()
                .id(1L)
                .username("testuser")
                .displayName("Old Name")
                .bio("Old bio")
                .avatarUrl("old-avatar.jpg")
                .build();
        UpdateProfileRequest request = new UpdateProfileRequest(
                "New Name", "New bio", "new-avatar.jpg");

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenReturn(user);

        UserDto result = userService.updateProfile(1L, request);

        assertNotNull(result);
        assertEquals("New Name", result.getDisplayName());
        assertEquals("New bio", result.getBio());
        assertEquals("new-avatar.jpg", result.getAvatarUrl());
    }
}
