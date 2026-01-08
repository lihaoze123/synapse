package com.synapse.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.synapse.dto.AiChatRequest;
import com.synapse.dto.AiStreamChunk;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URI;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Consumer;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class AiService {

    @Value("${ai.base-url:https://api.openai.com/v1}")
    private String baseUrl;

    @Value("${ai.api-key:}")
    private String apiKey;

    @Value("${ai.model:gpt-4o}")
    private String model;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public boolean isConfigured() {
        return apiKey != null && !apiKey.isBlank();
    }

    public void streamChat(AiChatRequest request, Consumer<AiStreamChunk> onData, Runnable onComplete) {
        HttpURLConnection conn = null;
        StringBuilder contentBuilder = new StringBuilder();
        try {
            conn = (HttpURLConnection) URI.create(baseUrl + "/chat/completions")
                    .toURL().openConnection();
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Content-Type", "application/json");
            conn.setRequestProperty("Authorization", "Bearer " + apiKey);
            conn.setDoOutput(true);

            Map<String, Object> body = new HashMap<>();
            body.put("model", model);
            body.put("messages", request.getMessages().stream()
                    .filter(m -> m.getContent() != null && !m.getContent().isBlank())
                    .toList());
            body.put("stream", true);

            String requestBody = objectMapper.writeValueAsString(body);
            log.debug("AI request URL: {}", baseUrl + "/chat/completions");
            log.debug("AI request body: {}", requestBody);
            conn.getOutputStream().write(objectMapper.writeValueAsBytes(body));

            int responseCode = conn.getResponseCode();
            log.debug("AI response code: {}", responseCode);

            if (responseCode != HttpURLConnection.HTTP_OK) {
                String errorResponse = readErrorStream(conn);
                log.error("AI API error - Code: {}, Response: {}", responseCode, errorResponse);
                onData.accept(AiStreamChunk.builder()
                        .type("error")
                        .delta("[Error: API returned " + responseCode + " - " + errorResponse + "]")
                        .content("[Error: API returned " + responseCode + " - " + errorResponse + "]")
                        .build());
                onComplete.run();
                return;
            }

            try (BufferedReader reader = new BufferedReader(
                    new InputStreamReader(conn.getInputStream()))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    if (line.startsWith("data: ")) {
                        String data = line.substring(6);
                        if ("[DONE]".equals(data)) {
                            break;
                        }
                        JsonNode node = objectMapper.readTree(data);
                        JsonNode delta = node.path("choices").path(0).path("delta").path("content");
                        if (!delta.isMissingNode() && !delta.isNull()) {
                            String deltaText = delta.asText();
                            contentBuilder.append(deltaText);
                            onData.accept(AiStreamChunk.builder()
                                    .type("content")
                                    .delta(deltaText)
                                    .content(contentBuilder.toString())
                                    .role("assistant")
                                    .model(model)
                                    .timestamp(System.currentTimeMillis())
                                    .build());
                        }
                    }
                }
            }
            onComplete.run();
        } catch (Exception e) {
            log.error("AI chat error", e);
            onData.accept(AiStreamChunk.builder()
                    .type("error")
                    .delta("[Error: " + e.getMessage() + "]")
                    .content("[Error: " + e.getMessage() + "]")
                    .build());
            onComplete.run();
        }
    }

    private String readErrorStream(HttpURLConnection conn) {
        try {
            BufferedReader errorReader = new BufferedReader(
                    new InputStreamReader(conn.getErrorStream()));
            StringBuilder response = new StringBuilder();
            String line;
            while ((line = errorReader.readLine()) != null) {
                response.append(line);
            }
            errorReader.close();
            return response.toString();
        } catch (Exception e) {
            return "Failed to read error: " + e.getMessage();
        }
    }
}
