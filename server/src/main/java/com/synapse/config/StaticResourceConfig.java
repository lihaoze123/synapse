package com.synapse.config;

import java.util.concurrent.TimeUnit;

import org.springframework.context.annotation.Configuration;
import org.springframework.http.CacheControl;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class StaticResourceConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Serve uploaded files under both /uploads/** and /api/uploads/**
        registry.addResourceHandler("/uploads/**", "/api/uploads/**")
                .addResourceLocations("file:./uploads/")
                .setCacheControl(CacheControl.maxAge(7, TimeUnit.DAYS).cachePublic());

        // Static assets from classpath (JS, CSS, images) - cache for 1 year
        registry.addResourceHandler("/assets/**", "/static/**")
                .addResourceLocations("classpath:/static/assets/", "classpath:/static/")
                .setCacheControl(CacheControl.maxAge(365, TimeUnit.DAYS).cachePublic());

        // HTML files - no cache to ensure updates are visible
        registry.addResourceHandler("/*.html")
                .addResourceLocations("classpath:/static/")
                .setCacheControl(CacheControl.noCache());
    }
}
