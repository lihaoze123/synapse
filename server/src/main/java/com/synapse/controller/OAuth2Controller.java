package com.synapse.controller;

import com.synapse.dto.ApiResponse;
import com.synapse.dto.AuthResponse;
import com.synapse.service.OAuth2CodeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/auth/oauth2")
@Tag(name = "OAuth2 Authentication", description = "OAuth2 login endpoints")
public class OAuth2Controller {

    private final OAuth2CodeService codeService;

    public OAuth2Controller(OAuth2CodeService codeService) {
        this.codeService = codeService;
    }

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

    @PostMapping("/exchange")
    @Operation(summary = "Exchange one-time code for JWT and user info")
    public ResponseEntity<ApiResponse<AuthResponse>> exchangeCode(@RequestBody Map<String, String> body) {
        String code = body.get("code");
        AuthResponse payload = codeService.consume(code);
        if (payload == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Invalid or expired code"));
        }
        return ResponseEntity.ok(ApiResponse.success("OK", payload));
    }
}
