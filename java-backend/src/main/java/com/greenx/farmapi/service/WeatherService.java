package com.greenx.farmapi.service;

import com.greenx.farmapi.model.WeatherData;
import com.greenx.farmapi.model.WeatherData.CurrentWeather;
import com.greenx.farmapi.model.WeatherData.ForecastDay;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Fetches real-time weather data from WeatherAPI.com.
 *
 * Required environment variable: WEATHER_API_KEY
 * Optional:                      WEATHER_API_URL (defaults to https://api.weatherapi.com/v1)
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class WeatherService {

    @Value("${weather.api.key:}")
    private String weatherApiKey;

    @Value("${weather.api.url:https://api.weatherapi.com/v1}")
    private String weatherApiUrl;

    private final RestTemplate restTemplate;

    /**
     * Returns current weather + 5-day forecast for the given location.
     *
     * @param village  village / city name used as the primary location query
     * @param pincode  optional pincode appended to the query for disambiguation
     */
    public WeatherData getWeatherByLocation(String village, String pincode) {
        if (weatherApiKey == null || weatherApiKey.isBlank()) {
            log.warn("WEATHER_API_KEY is not configured — returning null");
            return null;
        }

        try {
            // Build location query: "village pincode" or just "village"
            String locationQuery = (pincode != null && !pincode.isBlank())
                    ? village + " " + pincode
                    : village;

            String forecastUrl = UriComponentsBuilder
                    .fromHttpUrl(weatherApiUrl + "/forecast.json")
                    .queryParam("key", weatherApiKey)
                    .queryParam("q", locationQuery)
                    .queryParam("days", 5)
                    .queryParam("aqi", "no")
                    .queryParam("alerts", "no")
                    .toUriString();

            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.getForObject(forecastUrl, Map.class);

            if (response == null) {
                log.warn("Empty response from WeatherAPI for location: {}", locationQuery);
                return null;
            }

            return mapResponse(response);

        } catch (Exception e) {
            log.error("Failed to fetch weather for village='{}', pincode='{}': {}",
                    village, pincode, e.getMessage());
            return null;
        }
    }

    // -------------------------------------------------------------------------
    // Private helpers — map WeatherAPI.com JSON to our WeatherData model
    // -------------------------------------------------------------------------

    @SuppressWarnings("unchecked")
    private WeatherData mapResponse(Map<String, Object> response) {
        // --- location ---
        Map<String, Object> loc = (Map<String, Object>) response.get("location");
        String locationName = loc != null ? String.valueOf(loc.get("name")) : "Unknown";

        // --- current ---
        Map<String, Object> cur = (Map<String, Object>) response.get("current");
        CurrentWeather current = mapCurrent(cur);

        // --- forecast ---
        List<ForecastDay> forecastDays = new ArrayList<>();
        Map<String, Object> forecastObj = (Map<String, Object>) response.get("forecast");
        if (forecastObj != null) {
            List<Map<String, Object>> forecastday =
                    (List<Map<String, Object>>) forecastObj.get("forecastday");
            if (forecastday != null) {
                for (Map<String, Object> day : forecastday) {
                    forecastDays.add(mapForecastDay(day));
                }
            }
        }

        return new WeatherData(locationName, current, forecastDays);
    }

    @SuppressWarnings("unchecked")
    private CurrentWeather mapCurrent(Map<String, Object> cur) {
        if (cur == null) return new CurrentWeather(0.0, 0, 0.0, 0.0, 0, "Unknown");

        double tempC    = toDouble(cur.get("temp_c"));
        int    humidity = toInt(cur.get("humidity"));
        double windKph  = toDouble(cur.get("wind_kph"));
        double precipMm = toDouble(cur.get("precip_mm"));

        Map<String, Object> condition = (Map<String, Object>) cur.get("condition");
        String description = condition != null ? String.valueOf(condition.get("text")) : "Unknown";

        int condCode    = condition != null ? toInt(condition.get("code")) : 0;
        int weatherCode = mapConditionCode(condCode);

        return new CurrentWeather(tempC, humidity, windKph, precipMm, weatherCode, description);
    }

    @SuppressWarnings("unchecked")
    private ForecastDay mapForecastDay(Map<String, Object> dayEntry) {
        String date = String.valueOf(dayEntry.get("date"));
        Map<String, Object> day = (Map<String, Object>) dayEntry.get("day");
        if (day == null) return new ForecastDay(date, 0.0, 0.0, 0.0, 0);

        double maxTemp = toDouble(day.get("maxtemp_c"));
        double minTemp = toDouble(day.get("mintemp_c"));
        double precip  = toDouble(day.get("totalprecip_mm"));

        Map<String, Object> condition = (Map<String, Object>) day.get("condition");
        int condCode    = condition != null ? toInt(condition.get("code")) : 0;
        int weatherCode = mapConditionCode(condCode);

        return new ForecastDay(date, maxTemp, minTemp, precip, weatherCode);
    }

    /**
     * Converts WeatherAPI.com condition codes to the simplified weather_code
     * scale used by the frontend WeatherWidget:
     *   0-1  = clear / sunny
     *   2-3  = cloudy / overcast
     *   61+  = rain
     *   80+  = heavy rain / thunderstorm
     */
    private int mapConditionCode(int apiCode) {
        if (apiCode == 1000) return 0;                                          // clear
        if (apiCode <= 1003) return 1;                                          // partly cloudy
        if (apiCode <= 1009) return 3;                                          // overcast
        if (apiCode >= 1273) return 80;                                         // thunderstorm
        if (apiCode >= 1180) return 61;                                         // rain
        if (apiCode == 1063 || apiCode == 1150 || apiCode == 1153) return 61;   // light rain
        return 2;                                                               // default: cloudy
    }

    private double toDouble(Object val) {
        if (val == null) return 0.0;
        if (val instanceof Number) return ((Number) val).doubleValue();
        try { return Double.parseDouble(val.toString()); } catch (NumberFormatException e) { return 0.0; }
    }

    private int toInt(Object val) {
        if (val == null) return 0;
        if (val instanceof Number) return ((Number) val).intValue();
        try { return Integer.parseInt(val.toString()); } catch (NumberFormatException e) { return 0; }
    }
}
