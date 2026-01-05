package com.synapse.service;

import com.synapse.dto.AuthResponse;
import com.synapse.dto.UserDto;
import com.synapse.entity.AuthProvider;
import com.synapse.entity.User;
import com.synapse.repository.UserRepository;
import com.synapse.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class OAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oauth2User = super.loadUser(userRequest);
        String registrationId = userRequest.getClientRegistration().getRegistrationId();

        AuthProvider provider = switch (registrationId.toLowerCase()) {
            case "github" -> AuthProvider.GITHUB;
            case "google" -> AuthProvider.GOOGLE;
            default -> throw new OAuth2AuthenticationException("Unsupported provider: " + registrationId);
        };

        try {
            processOAuth2User(oauth2User, provider);
        } catch (Exception e) {
            throw new OAuth2AuthenticationException(e.getMessage());
        }

        return oauth2User;
    }

    public AuthResponse processOAuth2User(OAuth2User oauth2User, AuthProvider provider) {
        String email = extractEmail(oauth2User, provider);
        String providerId = extractProviderId(oauth2User, provider);
        String username = extractUsername(oauth2User, provider);
        String avatarUrl = extractAvatarUrl(oauth2User, provider);

        User user = userRepository.findByEmail(email).orElse(null);

        if (user == null) {
            user = User.builder()
                .username(username)
                .email(email)
                .password("")
                .provider(provider)
                .providerId(providerId)
                .avatarUrl(avatarUrl)
                .displayName(username)
                .build();
            user = userRepository.save(user);
        } else if (user.getProvider() == AuthProvider.LOCAL) {
            user.setProvider(provider);
            user.setProviderId(providerId);
            if (user.getAvatarUrl() == null || user.getAvatarUrl().isEmpty()) {
                user.setAvatarUrl(avatarUrl);
            }
            user = userRepository.save(user);
        } else if (user.getProvider() != provider) {
            throw new IllegalArgumentException(
                "Email already registered with " + user.getProvider() + ". Please login using " + user.getProvider()
            );
        }

        String token = jwtUtil.generateToken(user.getId(), user.getUsername());

        return AuthResponse.builder()
            .token(token)
            .user(UserDto.fromEntity(user))
            .build();
    }

    private String extractEmail(OAuth2User oauth2User, AuthProvider provider) {
        return switch (provider) {
            case GITHUB -> oauth2User.getAttribute("email");
            case GOOGLE -> oauth2User.getAttribute("email");
            default -> throw new IllegalArgumentException("Unknown provider: " + provider);
        };
    }

    private String extractProviderId(OAuth2User oauth2User, AuthProvider provider) {
        Object id = switch (provider) {
            case GITHUB -> oauth2User.getAttribute("id");
            case GOOGLE -> oauth2User.getAttribute("sub");
            default -> throw new IllegalArgumentException("Unknown provider: " + provider);
        };
        return id != null ? id.toString() : null;
    }

    private String extractUsername(OAuth2User oauth2User, AuthProvider provider) {
        return switch (provider) {
            case GITHUB -> {
                String login = oauth2User.getAttribute("login");
                yield login != null ? login : extractEmail(oauth2User, provider).split("@")[0];
            }
            case GOOGLE -> {
                String name = oauth2User.getAttribute("name");
                yield name != null ? name : extractEmail(oauth2User, provider).split("@")[0];
            }
            default -> throw new IllegalArgumentException("Unknown provider: " + provider);
        };
    }

    private String extractAvatarUrl(OAuth2User oauth2User, AuthProvider provider) {
        return switch (provider) {
            case GITHUB -> oauth2User.getAttribute("avatar_url");
            case GOOGLE -> oauth2User.getAttribute("picture");
            default -> null;
        };
    }
}
