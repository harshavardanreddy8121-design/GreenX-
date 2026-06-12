package com.greenx.farmapi.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

import java.util.concurrent.TimeUnit;

/**
 * Application-wide beans: RestTemplate for outbound HTTP calls and a
 * Caffeine-backed CacheManager for the "weather" cache (30-minute TTL).
 */
@Configuration
@EnableCaching
public class AppConfig {

    @Value("${weather.cache.duration:1800}")
    private long cacheDurationSeconds;

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }

    @Bean
    public CacheManager cacheManager() {
        CaffeineCacheManager manager = new CaffeineCacheManager("weather");
        manager.setCaffeine(
            Caffeine.newBuilder()
                .expireAfterWrite(cacheDurationSeconds, TimeUnit.SECONDS)
                .maximumSize(500)
        );
        return manager;
    }
}
