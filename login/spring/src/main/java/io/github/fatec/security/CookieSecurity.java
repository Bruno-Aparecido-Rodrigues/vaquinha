package io.github.fatec.security;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.Optional;

/**
 * Centraliza o cookie de autenticação.
 * HttpOnly: o JavaScript do front não consegue ler o token
 */
@Component
public class CookieSecurity {
    public static final String ACCESS_TOKEN_COOKIE = "access_token";

    private final JwtSecurity jwtSecurity;
    private final boolean secure;

    public CookieSecurity(JwtSecurity jwtSecurity, @Value("${cookie.secure}") boolean secure) {
        this.jwtSecurity = jwtSecurity;
        this.secure = secure;
    }

    /**
     * @param lembrar true = cookie persistente (sobrevive ao fechar o navegador)
     *                false = cookie de sessão (some ao fechar o navegador)
     */
    public ResponseCookie criar(String token, boolean lembrar) {
        ResponseCookie.ResponseCookieBuilder builder = ResponseCookie.from(ACCESS_TOKEN_COOKIE, token)
                .httpOnly(true)
                .secure(secure)
                .sameSite("Strict")
                .path("/");
        if (lembrar) {
            builder.maxAge(jwtSecurity.getExpirationSeconds());
        }
        return builder.build();
    }

    public ResponseCookie apagar() {
        return ResponseCookie.from(ACCESS_TOKEN_COOKIE, "")
                .httpOnly(true)
                .secure(secure)
                .sameSite("Strict")
                .path("/")
                .maxAge(0)
                .build();
    }

    // Lê o token do cookie; se não houver, aceita também o cabeçalho Authorization: Bearer
    public Optional<String> lerToken(HttpServletRequest request) {
        if (request.getCookies() != null) {
            Optional<String> doCookie = Arrays.stream(request.getCookies())
                    .filter(c -> ACCESS_TOKEN_COOKIE.equals(c.getName()))
                    .map(Cookie::getValue)
                    .filter(v -> !v.isBlank())
                    .findFirst();
            if (doCookie.isPresent()) {
                return doCookie;
            }
        }
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            return Optional.of(header.substring(7));
        }
        return Optional.empty();
    }
}
