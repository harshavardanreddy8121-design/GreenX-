package com.greenx.farmapi.security;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    // Comma-separated list of allowed origins; set ALLOWED_ORIGINS env var in
    // production to override the defaults below.
    // e.g. ALLOWED_ORIGINS=https://your-app.vercel.app,https://www.yourdomain.com
    @Value("${cors.allowed-origins:${ALLOWED_ORIGINS:" +
            "http://localhost:3000," +
            "http://localhost:5173," +
            "http://localhost:8080," +
            "https://greenx.vercel.app," +
            "https://mygreenx.vercel.app," +
            "https://greenx-1.onrender.com," +
            "https://spring-boot-backend-production-13e6.up.railway.app}}")
    private String allowedOrigins;

    private final JwtFilter jwtFilter;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final UserDetailsServiceImpl userDetailsService;
    private final PasswordEncoder passwordEncoder;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Public endpoints
                        .requestMatchers("/auth/**", "/health", "/land-registration/submit").permitAll()
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        // Role-specific path rules
                        .requestMatchers("/admin/**").hasAnyRole("ADMIN", "CLUSTER_ADMIN")
                        .requestMatchers("/expert/**").hasRole("EXPERT")
                        .requestMatchers("/field/**").hasRole("FIELD_MANAGER")
                        .requestMatchers("/fieldmanager/**").hasRole("FIELD_MANAGER")
                        .requestMatchers("/worker/**").hasRole("WORKER")
                        .requestMatchers("/land/**").hasAnyRole("LANDOWNER", "LAND_OWNER")
                        .requestMatchers("/landowner/**").hasAnyRole("LANDOWNER", "LAND_OWNER")
                        .requestMatchers("/profile").authenticated()
                        // Everything else requires authentication
                        .anyRequest().authenticated())
                .authenticationProvider(authenticationProvider())
                // JwtAuthenticationFilter runs first and sets the SecurityContext with
                // the resolved UserRole enum.  JwtFilter is kept for backward compatibility
                // but will skip processing when authentication is already present.
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                .addFilterAfter(jwtFilter, JwtAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder);
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        List<String> originList = Arrays.stream(allowedOrigins.split(","))
                .map(String::trim)
                .filter(origin -> !origin.isEmpty())
                .collect(Collectors.toList());

        if (originList.size() == 1 && "*".equals(originList.get(0))) {
            // Wildcard — use pattern matching so credentials still work
            config.setAllowedOriginPatterns(List.of("*"));
        } else {
            // Always add Vercel preview-deployment pattern so any *.vercel.app
            // subdomain (e.g. greenx-git-main-xyz.vercel.app) is also allowed.
            config.setAllowedOriginPatterns(List.of("https://*.vercel.app", "http://localhost:*"));
            config.setAllowedOrigins(originList);
        }
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        config.setAllowedHeaders(List.of("*"));
        config.setExposedHeaders(List.of("Authorization"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
