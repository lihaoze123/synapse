package com.synapse.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = OAuth2Controller.class,
    excludeAutoConfiguration = {
        org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration.class,
        org.springframework.boot.autoconfigure.security.oauth2.client.servlet.OAuth2ClientAutoConfiguration.class
    })
@ContextConfiguration(classes = OAuth2Controller.class)
class OAuth2ControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void shouldReturnGitHubAuthorizationUrl() throws Exception {
        mockMvc.perform(get("/api/auth/oauth2/authorize/github"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.authorizationUrl").value("/oauth2/authorization/github"));
    }

    @Test
    void shouldReturnGoogleAuthorizationUrl() throws Exception {
        mockMvc.perform(get("/api/auth/oauth2/authorize/google"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.authorizationUrl").value("/oauth2/authorization/google"));
    }
}
