package com.synapse.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/auth/oauth2")
@Tag(name = "OAuth2 Authentication", description = "OAuth2 login endpoints")
public class OAuth2Controller {

    @GetMapping("/authorize/github")
    @Operation(summary = "Get GitHub OAuth2 authorization URL")
    public ResponseEntity<Map<String, String>> getGitHubAuthorizationUrl() {
        return ResponseEntity.ok(Map.of(
            "authorizationUrl", "/oauth2/authorization/github"
        ));
    }

    @GetMapping("/authorize/google")
    @Operation(summary = "Get Google OAuth2 authorization URL")
    public ResponseEntity<Map<String, String>> getGoogleAuthorizationUrl() {
        return ResponseEntity.ok(Map.of(
            "authorizationUrl", "/oauth2/authorization/google"
        ));
    }
}
