package io.github.fatec.security;

import org.springframework.http.HttpCookie;
import org.springframework.http.HttpHeaders;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.server.resource.authentication.BearerTokenAuthenticationToken;
import org.springframework.security.web.server.authentication.ServerAuthenticationConverter;
import org.springframework.security.web.server.util.matcher.ServerWebExchangeMatcher;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

/**
 * Por padrão o resource server só lê o token do cabeçalho Authorization.
 * Este conversor lê o token do cookie "access_token" (enviado automaticamente pelo navegador)
 * e, como alternativa, do cabeçalho Authorization: Bearer (útil para k6/Postman).
 *
 * Nas rotas públicas (login, cadastro, logout) o token é ignorado: assim um cookie
 * vencido não impede o usuário de fazer login de novo.
 */
public class CookieBearerTokenConverter implements ServerAuthenticationConverter {
    public static final String ACCESS_TOKEN_COOKIE = "access_token";

    private final ServerWebExchangeMatcher rotasPublicas;

    public CookieBearerTokenConverter(ServerWebExchangeMatcher rotasPublicas) {
        this.rotasPublicas = rotasPublicas;
    }

    @Override
    public Mono<Authentication> convert(ServerWebExchange exchange) {
        return rotasPublicas.matches(exchange).flatMap(match -> {
            if (match.isMatch()) {
                return Mono.empty();
            }
            String token = lerToken(exchange);
            if (token == null) {
                return Mono.empty();
            }
            return Mono.just((Authentication) new BearerTokenAuthenticationToken(token));
        });
    }

    private String lerToken(ServerWebExchange exchange) {
        HttpCookie cookie = exchange.getRequest().getCookies().getFirst(ACCESS_TOKEN_COOKIE);
        if (cookie != null && !cookie.getValue().isBlank()) {
            return cookie.getValue();
        }
        String header = exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
        if (header != null && header.startsWith("Bearer ")) {
            return header.substring(7);
        }
        return null;
    }
}
