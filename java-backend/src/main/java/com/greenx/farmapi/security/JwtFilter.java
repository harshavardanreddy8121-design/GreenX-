package com.greenx.farmapi.security;

import com.greenx.farmapi.util.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(JwtFilter.class);

    private final JwtUtil jwtUtil;
    private final UserDetailsServiceImpl userDetailsService;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getServletPath();
        String method = request.getMethod();

        return "OPTIONS".equalsIgnoreCase(method)
                || path.equals("/auth")
                || path.startsWith("/auth/")
                || path.equals("/api/auth")
                || path.startsWith("/api/auth/")
                || path.equals("/health")
                || path.equals("/api/health");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        // Skip if authentication was already established by JwtAuthenticationFilter
        if (SecurityContextHolder.getContext().getAuthentication() != null) {
            filterChain.doFilter(request, response);
            return;
        }

        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);
        if (jwtUtil.validateToken(token)) {
            String email = jwtUtil.extractEmail(token);
            log.debug("JwtFilter: valid token received, extracted email={}", email);
            if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                try {
                    UserDetails userDetails = userDetailsService.loadUserByUsername(email);
                    log.debug("JwtFilter: user loaded successfully for email={}", email);
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities());
                    authToken.setDetails(
                            new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                } catch (UsernameNotFoundException ex) {
                    log.warn("JwtFilter: user not found for email={} – leaving request unauthenticated", email);
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.getWriter().write("{\"error\":\"User not found for token\"}");
                    return;
                } catch (Exception ex) {
                    log.error("JwtFilter: unexpected error loading user for email={}", email, ex);
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.getWriter().write("{\"error\":\"Authentication failed\"}");
                    return;
                }
            }
        } else {
            log.debug("JwtFilter: token validation failed for request to {}", request.getServletPath());
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("{\"error\":\"Token expired or invalid\"}");
            return;
        }

        filterChain.doFilter(request, response);
    }
}
