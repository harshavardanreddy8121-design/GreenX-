package com.greenx.farmapi.controller;

import com.greenx.farmapi.dto.ApiResponse;
import com.greenx.farmapi.model.WeatherData;
import com.greenx.farmapi.service.WeatherService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;

/**
 * Handles GET /data/weather — the URL the frontend WeatherWidget already calls
 * via javaApi.select('weather', { eq: { village, pincode } }).
 *
 * The DataController's generic /{tableName} handler would normally intercept
 * this, but Spring MVC resolves more-specific path mappings first, so this
 * controller takes precedence for the "weather" path segment.
 */
@Slf4j
@RestController
@RequestMapping("/data/weather")
@RequiredArgsConstructor
public class WeatherController {

    private final WeatherService weatherService;

    /**
     * GET /data/weather?village={village}&pincode={pincode}
     *
     * Returns an ApiResponse wrapping a single-element list so the frontend
     * can do: const data = (response.data as any[])[0]
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<WeatherData>>> getWeather(
            @RequestParam String village,
            @RequestParam(required = false) String pincode) {

        try {
            WeatherData weather = weatherService.getWeatherByLocation(village, pincode);

            if (weather == null) {
                // Return empty list — WeatherWidget already handles null gracefully
                return ResponseEntity.ok(ApiResponse.success(Collections.emptyList()));
            }

            return ResponseEntity.ok(ApiResponse.success(List.of(weather)));

        } catch (Exception e) {
            log.error("Weather fetch failed for village='{}': {}", village, e.getMessage());
            return ResponseEntity.ok(ApiResponse.success(Collections.emptyList()));
        }
    }
}
