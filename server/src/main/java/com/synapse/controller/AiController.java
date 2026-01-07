package com.synapse.controller;

import com.synapse.dto.AiChatRequest;
import com.synapse.dto.ApiResponse;
import com.synapse.service.AiService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@Tag(name = "AI", description = "AI chat endpoints")
public class AiController {

    private final AiService aiService;

    @PostMapping(value = "/chat", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    @Operation(summary = "AI chat", description = "Stream AI chat responses via SSE")
    public ResponseEntity<?> chat(@Valid @RequestBody AiChatRequest request) {
        if (!aiService.isConfigured()) {
            return ResponseEntity.status(503)
                    .body(ApiResponse.error("AI service not configured"));
        }

        SseEmitter emitter = new SseEmitter(60000L);

        new Thread(() -> aiService.streamChat(
                request,
                content -> {
                    try {
                        emitter.send(SseEmitter.event()
                                .name("message")
                                .data(content));
                    } catch (Exception e) {
                        emitter.completeWithError(e);
                    }
                },
                emitter::complete
        )).start();

        return ResponseEntity.ok(emitter);
    }
}
