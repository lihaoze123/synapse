package com.synapse.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.jsontype.BasicPolymorphicTypeValidator;
import com.fasterxml.jackson.databind.jsontype.PolymorphicTypeValidator;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import java.time.Duration;
import java.util.HashMap;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

@Configuration
@EnableCaching
@ConditionalOnProperty(name = "cache.enabled", havingValue = "true")
public class RedisConfig {

    @Value("${cache.ttl.tags:30}")
    private long tagsTtl;

    @Value("${cache.ttl.posts:10}")
    private long postsTtl;

    @Value("${cache.ttl.users:15}")
    private long usersTtl;

    @Value("${cache.ttl.counts:5}")
    private long countsTtl;

    @Value("${cache.ttl.comments:10}")
    private long commentsTtl;

    @Bean
    public RedisCacheManager cacheManager(RedisConnectionFactory connectionFactory) {
        PolymorphicTypeValidator ptv = BasicPolymorphicTypeValidator.builder()
                .allowIfSubType("com.synapse.dto")
                .allowIfSubType("java.util")
                .allowIfSubType("java.time")
                .allowIfSubType("java.lang")
                .allowIfSubType("org.springframework.data.domain")
                .build();

        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.registerModules(new JavaTimeModule());
        objectMapper.activateDefaultTypingAsProperty(ptv, ObjectMapper.DefaultTyping.NON_FINAL, "@class");

        GenericJackson2JsonRedisSerializer serializer = new GenericJackson2JsonRedisSerializer(objectMapper);

        RedisCacheConfiguration defaultConfig = RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofMinutes(10))
                .serializeKeysWith(RedisSerializationContext.SerializationPair
                        .fromSerializer(new StringRedisSerializer()))
                .serializeValuesWith(RedisSerializationContext.SerializationPair
                        .fromSerializer(serializer))
                .disableCachingNullValues();

        Map<String, RedisCacheConfiguration> cacheConfigurations = new HashMap<>();
        cacheConfigurations.put("tags", defaultConfig.entryTtl(Duration.ofMinutes(tagsTtl)));
        cacheConfigurations.put("posts", defaultConfig.entryTtl(Duration.ofMinutes(postsTtl)));
        cacheConfigurations.put("users", defaultConfig.entryTtl(Duration.ofMinutes(usersTtl)));
        cacheConfigurations.put("counts", defaultConfig.entryTtl(Duration.ofMinutes(countsTtl)));
        cacheConfigurations.put("comments", defaultConfig.entryTtl(Duration.ofMinutes(commentsTtl)));

        return RedisCacheManager.builder(connectionFactory)
                .cacheDefaults(defaultConfig)
                .withInitialCacheConfigurations(cacheConfigurations)
                .build();
    }
}
