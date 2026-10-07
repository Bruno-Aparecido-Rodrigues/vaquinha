package io.github.fatec.controller.request;

// Corpo do POST /login/auth.
public record LoginRequest(
        String email,
        String senha,
        Boolean lembrar
) {
}
