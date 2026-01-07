package com.synapse.service;

import com.synapse.dto.AuthResponse;
import com.synapse.dto.OAuth2UserProfile;
import com.synapse.dto.UserDto;
import com.synapse.entity.AuthProvider;
import com.synapse.entity.User;
import com.synapse.repository.UserRepository;
import com.synapse.util.JwtUtil;
import com.synapse.util.PasswordUtil;
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
    // Secure random for generating non-guessable placeholder passwords for OAuth-provisioned users
    private static final java.security.SecureRandom SECURE_RANDOM = new java.security.SecureRandom();

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
        OAuth2UserProfile profile = extractUserProfile(oauth2User, provider);
        User user = userRepository.findByEmail(profile.email()).orElse(null);

        if (user == null) {
            return createNewOAuthUser(profile);
        }

        if (user.getProvider() == AuthProvider.LOCAL) {
            return linkProviderToUser(user, profile);
        }

        if (user.getProvider() != provider) {
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

    private OAuth2UserProfile extractUserProfile(OAuth2User oauth2User, AuthProvider provider) {
        return new OAuth2UserProfile(
            extractEmail(oauth2User, provider),
            extractUsername(oauth2User, provider),
            extractProviderId(oauth2User, provider),
            extractAvatarUrl(oauth2User, provider),
            provider
        );
    }

    private AuthResponse createNewOAuthUser(OAuth2UserProfile profile) {
        String randomPassword = generateRandomPassword();
        User user = User.builder()
            .username(profile.username())
            .email(profile.email())
            .password(PasswordUtil.encode(randomPassword))
            .provider(profile.provider())
            .providerId(profile.providerId())
            .avatarUrl(profile.avatarUrl())
            .displayName(profile.username())
            .build();
        user = userRepository.save(user);
        String token = jwtUtil.generateToken(user.getId(), user.getUsername());
        return AuthResponse.builder()
            .token(token)
            .user(UserDto.fromEntity(user))
            .build();
    }

    private AuthResponse linkProviderToUser(User user, OAuth2UserProfile profile) {
        user.setProvider(profile.provider());
        user.setProviderId(profile.providerId());
        if (shouldUpdateAvatar(user)) {
            user.setAvatarUrl(profile.avatarUrl());
        }
        user = userRepository.save(user);
        String token = jwtUtil.generateToken(user.getId(), user.getUsername());
        return AuthResponse.builder()
            .token(token)
            .user(UserDto.fromEntity(user))
            .build();
    }

    private boolean shouldUpdateAvatar(User user) {
        return user.getAvatarUrl() == null || user.getAvatarUrl().isEmpty();
    }

    private String generateRandomPassword() {
        // 32 bytes => 256-bit random, Base64-url without padding to keep it cookie/URL safe if ever logged
        byte[] bytes = new byte[32];
        SECURE_RANDOM.nextBytes(bytes);
        return java.util.Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String extractEmail(OAuth2User oauth2User, AuthProvider provider) {
        String email = oauth2User.getAttribute("email");
        if (email != null && !email.isBlank()) {
            return email;
        }
        String providerId = extractProviderId(oauth2User, provider);
        if (providerId == null || providerId.isBlank()) {
            return generateFallbackEmail(provider, null);
        }
        String displayName = extractDisplayName(oauth2User, provider);
        return generateFallbackEmail(provider, displayName != null ? displayName : providerId);
    }

    private String extractDisplayName(OAuth2User oauth2User, AuthProvider provider) {
        return switch (provider) {
            case GITHUB -> oauth2User.getAttribute("login");
            case GOOGLE -> oauth2User.getAttribute("name");
            default -> null;
        };
    }

    private String generateFallbackEmail(AuthProvider provider, String identifier) {
        String suffix = identifier != null ? identifier : java.util.UUID.randomUUID().toString().replace("-", "");
        return (provider.name().toLowerCase() + "_" + suffix + "@oauth.local").toLowerCase();
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
        String displayName = extractDisplayName(oauth2User, provider);
        if (displayName != null && !displayName.isBlank()) {
            return displayName;
        }
        String providerId = extractProviderId(oauth2User, provider);
        String fallbackId = providerId != null ? providerId : "unknown";
        return provider.name().toLowerCase() + "_user_" + fallbackId;
    }

    private String extractAvatarUrl(OAuth2User oauth2User, AuthProvider provider) {
        return switch (provider) {
            case GITHUB -> oauth2User.getAttribute("avatar_url");
            case GOOGLE -> oauth2User.getAttribute("picture");
            default -> null;
        };
    }
}
