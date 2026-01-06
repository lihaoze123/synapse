package com.synapse.config;

import com.synapse.entity.AuthProvider;
import com.synapse.entity.User;
import com.synapse.repository.UserRepository;
import com.synapse.util.JwtUtil;
import com.synapse.dto.AuthResponse;
import com.synapse.dto.UserDto;
import com.synapse.service.OAuth2CodeService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final OAuth2CodeService codeService;

    @Value("${app.oauth2.redirect-uri:/oauth/callback}")
    private String redirectUri;

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

        // Build AuthResponse and hand it off with a one-time code to avoid exposing JWT in URL
        AuthResponse payload = AuthResponse.builder()
            .token(jwtUtil.generateToken(user.getId(), user.getUsername()))
            .user(UserDto.fromEntity(user))
            .build();
        String code = codeService.issueCode(payload);

        String targetUrl = redirectUri + "?code=" + URLEncoder.encode(code, StandardCharsets.UTF_8)
            + (stateFromRequest != null ? "&state=" + URLEncoder.encode(stateFromRequest, StandardCharsets.UTF_8) : "");
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

    private String escapeJson(String value) {
        if (value == null) {
            return "";
        }
        return value.replace("\\", "\\\\")
                   .replace("\"", "\\\"")
                   .replace("\n", "\\n")
                   .replace("\r", "\\r")
                   .replace("\t", "\\t");
    }
}
