package io.github.fatec.security;

import io.github.fatec.security.dto.AuthUserDetails;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

/**
 * Gera e valida o JWT. A mesma chave secreta fica configurada no gateway,
 * que valida o token antes de repassar a requisição aos microsserviços.
 */
@Component
public class JwtSecurity {
    private final SecretKey key;
    private final long expirationMillis;

    public JwtSecurity(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.expiration-minutes}") long expirationMinutes) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expirationMillis = expirationMinutes * 60 * 1000;
    }

    public long getExpirationSeconds() {
        return expirationMillis / 1000;
    }

    public String generateToken(AuthUserDetails details) {
        Date agora = new Date();
        return Jwts.builder()
                .subject(details.getUsername())
                .claim("userId", details.user().id())
                .claim("nome", details.user().nome())
                .claim("roles", details.getAuthorities().stream()
                        .map(GrantedAuthority::getAuthority)
                        .toList())
                .issuedAt(agora)
                .expiration(new Date(agora.getTime() + expirationMillis))
                .signWith(key, Jwts.SIG.HS256)
                .compact();
    }

    /** Retorna o e-mail (subject) do token. Lança exceção se o token for inválido ou expirado. */
    public String getEmail(String token) {
        return parseClaims(token).getSubject();
    }

    public boolean isTokenValid(String token, UserDetails user) {
        Claims claims = parseClaims(token);
        return claims.getSubject().equals(user.getUsername())
                && claims.getExpiration().after(new Date());
    }

    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
