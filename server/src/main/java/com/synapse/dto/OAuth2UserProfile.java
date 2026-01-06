package com.synapse.dto;

import com.synapse.entity.AuthProvider;

public record OAuth2UserProfile(
    String email,
    String username,
    String providerId,
    String avatarUrl,
    AuthProvider provider
) {
}
