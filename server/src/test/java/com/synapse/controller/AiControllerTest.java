package com.synapse.controller;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.when;

import com.synapse.dto.AiChatRequest;
import com.synapse.service.AiService;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.servlet.mvc.method.annotation.ResponseBodyEmitter;

@ExtendWith(MockitoExtension.class)
@DisplayName("AiController Tests")
class AiControllerTest {

    @Mock
    private AiService aiService;

    @InjectMocks
    private AiController aiController;

    @Test
    @DisplayName("chat should return ResponseBodyEmitter when AI not configured")
    void chat_shouldReturnSseEmitterWhenNotConfigured() {
        when(aiService.isConfigured()).thenReturn(false);

        AiChatRequest request = AiChatRequest.builder()
                .messages(List.of(
                        AiChatRequest.Message.builder()
                                .role("user")
                                .content("Hello")
                                .build()))
                .build();

        ResponseBodyEmitter emitter = aiController.chat(request);

        assertNotNull(emitter);
    }

    @Test
    @DisplayName("chat should return ResponseBodyEmitter when AI is configured")
    void chat_shouldReturnSseEmitterWhenConfigured() {
        when(aiService.isConfigured()).thenReturn(true);

        AiChatRequest request = AiChatRequest.builder()
                .messages(List.of(
                        AiChatRequest.Message.builder()
                                .role("user")
                                .content("Hello")
                                .build()))
                .build();

        ResponseBodyEmitter emitter = aiController.chat(request);

        assertNotNull(emitter);
    }
}
