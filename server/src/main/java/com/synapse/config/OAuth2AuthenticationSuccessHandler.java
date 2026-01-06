package com.synapse.config;

import com.synapse.entity.AuthProvider;
import com.synapse.entity.User;
import com.synapse.repository.UserRepository;
import com.synapse.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    @Value("${app.oauth2.redirect-uri:/oauth/callback}")
    private String redirectUri;

    @Value("${jwt.expiration:86400000}") // default 24h if not configured
    private long jwtExpirationMs;

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication) throws IOException {

        // Validate client-provided state to mitigate CSRF/login CSRF
        String stateFromRequest = request.getParameter("state");
        String stateFromCookie = getCookieValue(request, "oauth_state");
        if (stateFromCookie == null || !stateFromCookie.equals(stateFromRequest)) {
            response.sendRedirect(redirectUri + "?error=" +
                URLEncoder.encode("Invalid OAuth state", StandardCharsets.UTF_8));
            return;
        }
        // Clear the cookie after validation
        clearCookie(response, "oauth_state");

        OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();
        String registrationId = determineRegistrationId(request);
        AuthProvider provider = determineProvider(registrationId);

        String email = extractEmail(oauth2User, provider);
        User user = userRepository.findByEmail(email).orElse(null);

        if (user == null) {
            response.sendRedirect(redirectUri + "?error=" +
                URLEncoder.encode("User not found", StandardCharsets.UTF_8));
            return;
        }

        // Generate JWT and send via secure, HttpOnly cookie to avoid leaking it to frontend JS or URLs
        String jwt = jwtUtil.generateToken(user.getId(), user.getUsername());
        boolean secure = request.isSecure();
        ResponseCookie cookie = ResponseCookie.from("access_token", jwt)
            .httpOnly(true)
            .secure(secure)
            .sameSite("Lax")
            .path("/")
            .maxAge(Math.max(1, jwtExpirationMs / 1000)) // seconds
            .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        // Redirect without placing any sensitive data in the URL. Keep `state` for client-side continuity.
        String targetUrl = redirectUri
            + (stateFromRequest != null ? "?state=" + URLEncoder.encode(stateFromRequest, StandardCharsets.UTF_8) : "");
        getRedirectStrategy().sendRedirect(request, response, targetUrl);
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

    private String determineRegistrationId(HttpServletRequest request) {
        String requestUri = request.getRequestURI();
        if (requestUri.contains("github")) {
            return "github";
        } else if (requestUri.contains("google")) {
            return "google";
        }
        return "unknown";
    }

    private AuthProvider determineProvider(String registrationId) {
        return switch (registrationId.toLowerCase()) {
            case "github" -> AuthProvider.GITHUB;
            case "google" -> AuthProvider.GOOGLE;
            default -> AuthProvider.LOCAL;
        };
    }

    private String extractEmail(OAuth2User oauth2User, AuthProvider provider) {
        String email = oauth2User.getAttribute("email");
        if (email != null && !email.isBlank()) {
            return email;
        }
        // Mirror fallback used in OAuth2UserService to keep flows consistent
        String providerId = switch (provider) {
            case GITHUB -> {
                Object id = oauth2User.getAttribute("id");
                yield id != null ? id.toString() : null;
            }
            case GOOGLE -> {
                Object id = oauth2User.getAttribute("sub");
                yield id != null ? id.toString() : null;
            }
            default -> null;
        };
        String candidate = switch (provider) {
            case GITHUB -> {
                String login = oauth2User.getAttribute("login");
                yield login != null ? login : (providerId != null ? providerId : "unknown");
            }
            case GOOGLE -> {
                String name = oauth2User.getAttribute("name");
                yield name != null ? name : (providerId != null ? providerId : "unknown");
            }
            default -> "unknown";
        };
        return (provider.name().toLowerCase() + "_" + candidate + "@oauth.local").toLowerCase();
    }
}
