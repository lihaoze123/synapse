package com.synapse.service;

import com.synapse.dto.AuthResponse;
import com.synapse.dto.LoginRequest;
import com.synapse.dto.RegisterRequest;
import com.synapse.dto.UserDto;
import com.synapse.entity.User;
import com.synapse.repository.UserRepository;
import com.synapse.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Username already exists");
        }

        User user = User.builder()
            .username(request.getUsername())
            .password(request.getPassword())
            .avatarUrl(request.getAvatarUrl())
            .build();

        user = userRepository.save(user);

        String token = jwtUtil.generateToken(user.getId(), user.getUsername());

        return AuthResponse.builder()
            .token(token)
            .user(UserDto.fromEntity(user))
            .build();
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
            .orElseThrow(() -> new IllegalArgumentException("Invalid username or password"));

        if (!user.getPassword().equals(request.getPassword())) {
            throw new IllegalArgumentException("Invalid username or password");
        }

        String token = jwtUtil.generateToken(user.getId(), user.getUsername());

        return AuthResponse.builder()
            .token(token)
            .user(UserDto.fromEntity(user))
            .build();
    }

    public UserDto getCurrentUser(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return UserDto.fromEntity(user);
    }
}
