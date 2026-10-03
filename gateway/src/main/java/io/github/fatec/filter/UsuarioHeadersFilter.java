package io.github.fatec.filter;

import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.ReactiveSecurityContextHolder;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.stream.Collectors;

/**
 * Depois que o gateway valida o token, ele repassa quem é o usuário para os microsserviços
 * nos cabeçalhos abaixo. Assim Campanha e Doação sabem o id e o nome de quem está chamando
 * sem precisar validar o JWT de novo.
 *
 *   X-User-Id     id do usuário
 *   X-User-Email  e-mail
 *   X-User-Nome   nome (codificado em URL, por causa de acentos: use URLDecoder.decode)
 *   X-User-Roles  perfis separados por vírgula (ex.: ROLE_CLIENTE)
 *
 * Qualquer cabeçalho X-User-* que venha do navegador é removido antes, para ninguém se passar por outro usuário.
 */
@Component
public class UsuarioHeadersFilter implements GlobalFilter, Ordered {

    public static final String USER_ID = "X-User-Id";
    public static final String USER_EMAIL = "X-User-Email";
    public static final String USER_NOME = "X-User-Nome";
    public static final String USER_ROLES = "X-User-Roles";

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest limpa = exchange.getRequest().mutate()
                .headers(h -> {
                    h.remove(USER_ID);
                    h.remove(USER_EMAIL);
                    h.remove(USER_NOME);
                    h.remove(USER_ROLES);
                })
                .build();
        ServerWebExchange exchangeLimpo = exchange.mutate().request(limpa).build();

        return ReactiveSecurityContextHolder.getContext()
                .map(SecurityContext::getAuthentication)
                .filter(JwtAuthenticationToken.class::isInstance)
                .cast(JwtAuthenticationToken.class)
                .map(auth -> comUsuario(exchangeLimpo, auth))
                .defaultIfEmpty(exchangeLimpo)
                .flatMap(chain::filter);
    }

    private ServerWebExchange comUsuario(ServerWebExchange exchange, JwtAuthenticationToken auth) {
        Jwt jwt = auth.getToken();
        String id = valorOuVazio(jwt.getClaimAsString("userId"));
        String nome = URLEncoder.encode(valorOuVazio(jwt.getClaimAsString("nome")), StandardCharsets.UTF_8);
        String roles = auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.joining(","));

        ServerHttpRequest request = exchange.getRequest().mutate()
                .header(USER_ID, id)
                .header(USER_EMAIL, valorOuVazio(jwt.getSubject()))
                .header(USER_NOME, nome)
                .header(USER_ROLES, roles)
                .build();
        return exchange.mutate().request(request).build();
    }

    private String valorOuVazio(String valor) {
        return valor == null ? "" : valor;
    }

    @Override
    public int getOrder() {
        return Ordered.HIGHEST_PRECEDENCE;
    }
}
