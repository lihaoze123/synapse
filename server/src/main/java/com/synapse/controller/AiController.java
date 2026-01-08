package com.synapse.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.synapse.dto.AiChatRequest;
import com.synapse.dto.AiStreamChunk;
import com.synapse.service.AiService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.ResponseBodyEmitter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.UUID;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@Tag(name = "AI", description = "AI chat endpoints")
public class AiController {

    private final AiService aiService;
    private final ObjectMapper objectMapper;

    @PostMapping(value = "/chat", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    @Operation(summary = "AI chat", description = "Stream AI chat responses via SSE")
    public ResponseBodyEmitter chat(@Valid @RequestBody AiChatRequest request) {
        ResponseBodyEmitter emitter = new ResponseBodyEmitter(60000L);
        String chatId = UUID.randomUUID().toString();

        if (!aiService.isConfigured()) {
            try {
                sendSseData(emitter, AiStreamChunk.builder()
                        .type("error")
                        .id(chatId)
                        .delta("AI service not configured")
                        .content("AI service not configured")
                        .build());
            } catch (Exception e) {
                emitter.completeWithError(e);
            }
            emitter.complete();
            return emitter;
        }

        new Thread(() -> aiService.streamChat(
                request,
                chunk -> {
                    chunk.setId(chatId);
                    try {
                        sendSseData(emitter, chunk);
                    } catch (Exception e) {
                        emitter.completeWithError(e);
                    }
                },
                () -> {
                    try {
                        sendSseDone(emitter);
                    } catch (Exception ignored) {
                    }
                    emitter.complete();
                }
        )).start();

        return emitter;
    }

    private void sendSseData(ResponseBodyEmitter emitter, AiStreamChunk chunk) throws IOException {
        String json = objectMapper.writeValueAsString(chunk);
        String sse = "data: " + json + "\n\n";
        emitter.send(sse.getBytes(StandardCharsets.UTF_8));
    }

    private void sendSseDone(ResponseBodyEmitter emitter) throws IOException {
        emitter.send("data: [DONE]\n\n".getBytes(StandardCharsets.UTF_8));
    }
}
