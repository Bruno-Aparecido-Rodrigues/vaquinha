package io.github.fatec.config;

import io.github.fatec.security.CookieBearerTokenConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.oauth2.server.resource.authentication.ReactiveJwtAuthenticationConverter;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.security.web.server.util.matcher.ServerWebExchangeMatcher;
import org.springframework.security.web.server.util.matcher.ServerWebExchangeMatchers;
import reactor.core.publisher.Flux;

@Configuration
public class SecurityConfig {

    //rotas publicas
    private static final String[] ROTAS_PUBLICAS = {
            "/login/auth",
            "/login/v1/create",
            "/login/v1/logout"
    };

    @Bean
    public SecurityWebFilterChain securityWebFilterChain(ServerHttpSecurity http) {
        ServerWebExchangeMatcher publicas = ServerWebExchangeMatchers.pathMatchers(HttpMethod.POST, ROTAS_PUBLICAS);

        return http
                .csrf(ServerHttpSecurity.CsrfSpec::disable)
                .cors(Customizer.withDefaults())
                .httpBasic(ServerHttpSecurity.HttpBasicSpec::disable)
                .formLogin(ServerHttpSecurity.FormLoginSpec::disable)
                .authorizeExchange(exchange -> exchange
                        // Preflight do CORS
                        .pathMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        // Login, cadastro e logout
                        .matchers(publicas).permitAll()
                        // Área exclusiva do ADMIN
                        .pathMatchers("/relatorio/**").hasRole("ADMIN")
                        // Todo o resto logado
                        .anyExchange().authenticated()
                )
                .oauth2ResourceServer(oauth -> oauth
                        .bearerTokenConverter(new CookieBearerTokenConverter(publicas))
                        .jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter())))
                .build();
    }

    // O token traz os perfis na claim "roles" já com o ROLE_.
    @Bean
    public ReactiveJwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtGrantedAuthoritiesConverter converter = new JwtGrantedAuthoritiesConverter();
        converter.setAuthoritiesClaimName("roles");
        converter.setAuthorityPrefix("");

        ReactiveJwtAuthenticationConverter reactiveConverter = new ReactiveJwtAuthenticationConverter();
        reactiveConverter.setJwtGrantedAuthoritiesConverter(jwt -> Flux.fromIterable(converter.convert(jwt)));
        return reactiveConverter;
    }
}
