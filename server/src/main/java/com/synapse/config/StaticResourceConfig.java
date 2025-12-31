package com.synapse.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class StaticResourceConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Serve uploaded files under both /uploads/** and /api/uploads/**
        registry.addResourceHandler("/uploads/**", "/api/uploads/**")
                .addResourceLocations("file:./uploads/");
    }
}
