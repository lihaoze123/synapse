package com.synapse.config;

import com.synapse.service.OAuth2UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import jakarta.servlet.DispatcherType;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.http.HttpStatus;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.web.OAuth2AuthorizationRequestResolver;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final OAuth2UserService oAuth2UserService;
    private final OAuth2AuthenticationSuccessHandler oAuth2AuthenticationSuccessHandler;
    private final ClientRegistrationRepository clientRegistrationRepository;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            // For APIs, return 401 instead of redirecting to a login page when unauthenticated
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED))
            )
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .authorizeHttpRequests(auth -> auth
                // Important for SSE/async: allow subsequent ASYNC dispatches to flow without re-auth.
                // Initial request is still fully secured; this prevents AccessDenied on async writes.
                .dispatcherTypeMatchers(DispatcherType.ASYNC).permitAll()
                // Public endpoints
                .requestMatchers(
                    "/",
                    "/index.html",
                    "/assets/**",
                    "/uploads/**",
                    "/api/uploads/**",
                    "/swagger-ui/**",
                    "/v3/api-docs/**",
                    "/api/auth/login",
                    "/api/auth/register",
                    "/api/auth/oauth2/**",
                    "/oauth2/**",
                    "/login/oauth2/**",
                    "/api/ws/notifications**"
                ).permitAll()
                // Everything else under /api requires authentication
                .requestMatchers("/api/**").authenticated()
                // Allow the SPA and other resources
                .anyRequest().permitAll()
            )
            .oauth2Login(oauth2 -> oauth2
                .loginPage("/api/oauth2/login-redirect")
                .authorizationEndpoint(auth -> auth
                    .baseUri("/oauth2/authorization")
                    // Use a resolver that honors the client-provided `state` for CSRF protection
                    .authorizationRequestResolver(oAuth2AuthorizationRequestResolver())
                )
                .userInfoEndpoint(userInfo -> userInfo
                    .userService(oAuth2UserService)
                )
                .successHandler(oAuth2AuthenticationSuccessHandler)
            )
            .formLogin(form -> form.disable())
            .httpBasic(basic -> basic.disable())
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public OAuth2AuthorizationRequestResolver oAuth2AuthorizationRequestResolver() {
        // Delegate to Spring's default resolver and override the `state` if the client supplied one.
        return new StatePropagatingAuthorizationRequestResolver(clientRegistrationRepository, "/oauth2/authorization");
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
