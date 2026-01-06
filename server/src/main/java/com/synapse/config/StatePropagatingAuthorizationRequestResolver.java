package com.synapse.config;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.web.DefaultOAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.client.web.OAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest;
import org.springframework.util.StringUtils;

/**
 * Wraps the default resolver but replaces the generated `state` with a client-supplied one
 * when present as a request parameter. This allows the frontend to pre-generate a CSRF state
 * value and later validate it on the callback.
 */
public class StatePropagatingAuthorizationRequestResolver implements OAuth2AuthorizationRequestResolver {

    private final DefaultOAuth2AuthorizationRequestResolver delegate;

    public StatePropagatingAuthorizationRequestResolver(
        ClientRegistrationRepository clientRegistrationRepository,
        String authorizationRequestBaseUri
    ) {
        this.delegate = new DefaultOAuth2AuthorizationRequestResolver(
            clientRegistrationRepository, authorizationRequestBaseUri
        );
    }

    @Override
    public OAuth2AuthorizationRequest resolve(HttpServletRequest request) {
        OAuth2AuthorizationRequest resolved = delegate.resolve(request);
        return maybeOverrideState(request, resolved);
    }

    @Override
    public OAuth2AuthorizationRequest resolve(HttpServletRequest request, String clientRegistrationId) {
        OAuth2AuthorizationRequest resolved = delegate.resolve(request, clientRegistrationId);
        return maybeOverrideState(request, resolved);
    }

    private OAuth2AuthorizationRequest maybeOverrideState(
            HttpServletRequest request,
            OAuth2AuthorizationRequest resolved
    ) {
        if (resolved == null) {
            return null;
        }
        String suppliedState = request.getParameter("state");
        if (StringUtils.hasText(suppliedState)) {
            return OAuth2AuthorizationRequest.from(resolved)
                .state(suppliedState)
                .build();
        }
        return resolved;
    }
}
