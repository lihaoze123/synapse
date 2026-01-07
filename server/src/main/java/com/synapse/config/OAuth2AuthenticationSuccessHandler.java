package com.synapse.config;

import com.synapse.dto.AuthResponse;
import com.synapse.entity.AuthProvider;
import com.synapse.service.OAuth2UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final OAuth2UserService oAuth2UserService;

    @Value("${app.oauth2.redirect-uri:/oauth/callback}")
    private String redirectUri;

    @Value("${jwt.expiration:86400000}")
    private long jwtExpirationMs;

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication) throws IOException {

        String stateFromRequest = request.getParameter("state");
        String stateFromCookie = getCookieValue(request, "oauth_state");
        if (stateFromCookie == null || !constantTimeEquals(stateFromCookie, stateFromRequest)) {
            response.sendRedirect(redirectUri + "?error=" +
                URLEncoder.encode("Invalid OAuth state", StandardCharsets.UTF_8));
            return;
        }
        clearCookie(response, "oauth_state");

        OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();
        AuthProvider provider = determineProvider(request);

        AuthResponse authResponse;
        try {
            authResponse = oAuth2UserService.processOAuth2User(oauth2User, provider);
        } catch (OAuth2AuthenticationException e) {
            response.sendRedirect(redirectUri + "?error=" +
                URLEncoder.encode(e.getMessage(), StandardCharsets.UTF_8));
            return;
        } catch (IllegalArgumentException e) {
            response.sendRedirect(redirectUri + "?error=" +
                URLEncoder.encode(e.getMessage(), StandardCharsets.UTF_8));
            return;
        }

        boolean secure = isSecure(request);
        ResponseCookie cookie = ResponseCookie.from("access_token", authResponse.getToken())
            .httpOnly(true)
            .secure(secure)
            .sameSite("Lax")
            .path("/")
            .maxAge(Math.max(1, jwtExpirationMs / 1000))
            .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        String targetUrl = redirectUri
            + (stateFromRequest != null ? "?state=" + URLEncoder.encode(stateFromRequest, StandardCharsets.UTF_8) : "");
        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }

    private boolean isSecure(HttpServletRequest request) {
        boolean forwardedHttps = "https".equalsIgnoreCase(request.getHeader("X-Forwarded-Proto"));
        String fwd = request.getHeader("Forwarded");
        boolean forwardedHeaderHttps = fwd != null && fwd.toLowerCase().contains("proto=https");
        return request.isSecure() || forwardedHttps || forwardedHeaderHttps;
    }

    private boolean constantTimeEquals(String a, String b) {
        if (a == null || b == null) {
            return a == b;
        }
        if (a.length() != b.length()) {
            return false;
        }
        byte[] aBytes = a.getBytes(StandardCharsets.UTF_8);
        byte[] bBytes = b.getBytes(StandardCharsets.UTF_8);
        return MessageDigest.isEqual(aBytes, bBytes);
    }

    private String getCookieValue(HttpServletRequest request, String name) {
        if (request.getCookies() == null) {
            return null;
        }
        for (var cookie : request.getCookies()) {
            if (cookie.getName().equals(name)) {
                return cookie.getValue();
            }
        }
        return null;
    }

    private void clearCookie(HttpServletResponse response, String name) {
        var cookie = new jakarta.servlet.http.Cookie(name, "");
        cookie.setMaxAge(0);
        cookie.setPath("/");
        response.addCookie(cookie);
    }

    private AuthProvider determineProvider(HttpServletRequest request) {
        String requestUri = request.getRequestURI();
        if (requestUri.contains("github")) {
            return AuthProvider.GITHUB;
        } else if (requestUri.contains("google")) {
            return AuthProvider.GOOGLE;
        }
        return AuthProvider.LOCAL;
    }
}
