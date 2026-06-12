package com.greenx.farmapi.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Top-level weather response returned to the frontend WeatherWidget.
 * Shape: { location, current: { temperature, humidity, wind_speed,
 *           precipitation, weather_code, description }, forecast: [...] }
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class WeatherData {

    private String location;
    private CurrentWeather current;
    private List<ForecastDay> forecast;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CurrentWeather {
        private Double temperature;
        private Integer humidity;
        private Double wind_speed;
        private Double precipitation;
        private Integer weather_code;
        private String description;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ForecastDay {
        private String date;
        private Double temp_max;
        private Double temp_min;
        private Double precipitation;
        private Integer weather_code;
    }
}
