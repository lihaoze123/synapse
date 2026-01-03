package com.synapse.service;

import com.synapse.dto.PostDto;
import com.synapse.dto.UpdateProfileRequest;
import com.synapse.dto.UserDto;
import com.synapse.entity.User;
import com.synapse.repository.PostRepository;
import com.synapse.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PostRepository postRepository;

    @Cacheable(value = "users", key = "#id")
    @Transactional(readOnly = true)
    public UserDto getUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return UserDto.fromEntity(user);
    }

    @Cacheable(value = "users", key = "'username:' + #username")
    @Transactional(readOnly = true)
    public UserDto getUserByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return UserDto.fromEntity(user);
    }

    @Transactional(readOnly = true)
    public Page<PostDto> getUserPosts(Long userId, Pageable pageable) {
        if (!userRepository.existsById(userId)) {
            throw new IllegalArgumentException("User not found");
        }
        return postRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(PostDto::fromEntity);
    }

    @Caching(evict = {
        @CacheEvict(value = "users", key = "#userId"),
        @CacheEvict(value = "users", key = "'username:' + #result.username")
    })
    @Transactional
    public UserDto updateProfile(Long userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (request.getDisplayName() != null) {
            user.setDisplayName(request.getDisplayName());
        }

        if (request.getBio() != null) {
            user.setBio(request.getBio());
        }

        if (request.getAvatarUrl() != null) {
            user.setAvatarUrl(request.getAvatarUrl());
        }

        User saved = userRepository.save(user);
        return UserDto.fromEntity(saved);
    }
}
