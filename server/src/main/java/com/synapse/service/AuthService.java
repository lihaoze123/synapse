package com.synapse.service;

import com.synapse.dto.AuthResponse;
import com.synapse.dto.LoginRequest;
import com.synapse.dto.RegisterRequest;
import com.synapse.dto.UserDto;
import com.synapse.entity.User;
import com.synapse.repository.UserRepository;
import com.synapse.util.JwtUtil;
import com.synapse.util.PasswordUtil;
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
            .password(PasswordUtil.encode(request.getPassword()))
            .avatarUrl(request.getAvatarUrl())
            .build();

        user = userRepository.save(user);

        String token = jwtUtil.generateToken(user.getId(), user.getUsername());

        return AuthResponse.builder()
            .token(token)
            .user(UserDto.fromEntity(user))
            .build();
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
            .orElseThrow(() -> new IllegalArgumentException("Invalid username or password"));

        String storedPassword = user.getPassword();
        String rawPassword = request.getPassword();

        boolean passwordMatches;
        if (needsMigration(storedPassword)) {
            if (storedPassword.equals(rawPassword)) {
                String hashedPassword = PasswordUtil.encode(rawPassword);
                user.setPassword(hashedPassword);
                userRepository.save(user);
                passwordMatches = true;
            } else {
                passwordMatches = false;
            }
        } else {
            passwordMatches = PasswordUtil.matches(rawPassword, storedPassword);
        }

        if (!passwordMatches) {
            throw new IllegalArgumentException("Invalid username or password");
        }

        String token = jwtUtil.generateToken(user.getId(), user.getUsername());

        return AuthResponse.builder()
            .token(token)
            .user(UserDto.fromEntity(user))
            .build();
    }

    private boolean needsMigration(String password) {
        return !password.startsWith("$2a$") && !password.startsWith("$2b$")
            && !password.startsWith("$2y$");
    }

    public UserDto getCurrentUser(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return UserDto.fromEntity(user);
    }
}
