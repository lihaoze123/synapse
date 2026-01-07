package com.synapse.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

import com.synapse.dto.AiChatRequest;
import com.synapse.dto.ApiResponse;
import com.synapse.service.AiService;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

@ExtendWith(MockitoExtension.class)
@DisplayName("AiController Tests")
class AiControllerTest {

    @Mock
    private AiService aiService;

    @InjectMocks
    private AiController aiController;

    @Test
    @DisplayName("chat should return 503 when AI not configured")
    void chat_shouldReturn503WhenNotConfigured() {
        when(aiService.isConfigured()).thenReturn(false);

        AiChatRequest request = AiChatRequest.builder()
                .messages(List.of(
                        AiChatRequest.Message.builder()
                                .role("user")
                                .content("Hello")
                                .build()))
                .build();

        ResponseEntity<?> response = aiController.chat(request);

        assertEquals(503, response.getStatusCode().value());
        ApiResponse<?> body = (ApiResponse<?>) response.getBody();
        assertEquals(false, body.isSuccess());
        assertEquals("AI service not configured", body.getMessage());
    }
}
