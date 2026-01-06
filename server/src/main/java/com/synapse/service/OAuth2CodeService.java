package com.synapse.service;

import com.synapse.dto.AuthResponse;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Service;

/**
 * In-memory, single-use OAuth2 code store to hand off JWT/user via backend exchange
 * instead of leaking tokens in redirect URLs. Entries expire quickly.
 */
@Service
public class OAuth2CodeService {

    private static final long DEFAULT_TTL_SECONDS = 60; // short-lived

    private static final class CodeEntry {
        final AuthResponse payload;
        final Instant expiresAt;

        CodeEntry(AuthResponse payload, long ttlSeconds) {
            this.payload = payload;
            this.expiresAt = Instant.now().plusSeconds(ttlSeconds);
        }

        boolean expired() {
            return Instant.now().isAfter(expiresAt);
        }
    }

    private final Map<String, CodeEntry> store = new ConcurrentHashMap<>();

    public String issueCode(AuthResponse payload) {
        String code = UUID.randomUUID().toString().replace("-", "");
        store.put(code, new CodeEntry(payload, DEFAULT_TTL_SECONDS));
        return code;
    }

    public AuthResponse consume(String code) {
        if (code == null) {
            return null;
        }
        CodeEntry entry = store.remove(code);
        if (entry == null || entry.expired()) {
            return null;
        }
        return entry.payload;
    }
}

