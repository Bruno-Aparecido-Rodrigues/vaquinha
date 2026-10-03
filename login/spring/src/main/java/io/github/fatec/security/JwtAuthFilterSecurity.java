package io.github.fatec.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Autentica a requisição a partir do token que está no cookie access_token.
 * Token inválido ou expirado não derruba a requisição: ela segue sem autenticação
 * e o Spring Security responde 401 se a rota exigir login.
 */
public class JwtAuthFilterSecurity extends OncePerRequestFilter {
    private static final Logger logger = LoggerFactory.getLogger(JwtAuthFilterSecurity.class);

    private final JwtSecurity jwt;
    private final CookieSecurity cookieSecurity;
    private final UserDetailsService service;

    public JwtAuthFilterSecurity(JwtSecurity jwt, CookieSecurity cookieSecurity, UserDetailsService service) {
        this.jwt = jwt;
        this.cookieSecurity = cookieSecurity;
        this.service = service;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        cookieSecurity.lerToken(request).ifPresent(token -> {
            try {
                String email = jwt.getEmail(token);
                if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                    UserDetails userDetails = service.loadUserByUsername(email);
                    if (jwt.isTokenValid(token, userDetails)) {
                        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                                userDetails, null, userDetails.getAuthorities());
                        auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        SecurityContextHolder.getContext().setAuthentication(auth);
                    }
                }
            } catch (Exception ex) {
                logger.debug("Token ignorado: {}", ex.getMessage());
            }
        });

        filterChain.doFilter(request, response);
    }
}
