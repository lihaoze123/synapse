package com.synapse.service;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.lang.reflect.Field;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("AiService Tests")
class AiServiceTest {

    private AiService aiService;

    @BeforeEach
    void setUp() {
        aiService = new AiService();
    }

    private void setField(String fieldName, String value) throws Exception {
        Field field = AiService.class.getDeclaredField(fieldName);
        field.setAccessible(true);
        field.set(aiService, value);
    }

    @Test
    @DisplayName("isConfigured should return false when apiKey is null")
    void isConfigured_shouldReturnFalseWhenApiKeyNull() throws Exception {
        setField("apiKey", null);

        assertFalse(aiService.isConfigured());
    }

    @Test
    @DisplayName("isConfigured should return false when apiKey is blank")
    void isConfigured_shouldReturnFalseWhenApiKeyBlank() throws Exception {
        setField("apiKey", "   ");

        assertFalse(aiService.isConfigured());
    }

    @Test
    @DisplayName("isConfigured should return false when apiKey is empty")
    void isConfigured_shouldReturnFalseWhenApiKeyEmpty() throws Exception {
        setField("apiKey", "");

        assertFalse(aiService.isConfigured());
    }

    @Test
    @DisplayName("isConfigured should return true when apiKey is set")
    void isConfigured_shouldReturnTrueWhenApiKeySet() throws Exception {
        setField("apiKey", "sk-test-key");

        assertTrue(aiService.isConfigured());
    }
}
