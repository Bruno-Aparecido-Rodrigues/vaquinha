package io.github.fatec.controller.request;

public record LoginRequest(
        String email,
        String senha,
        Boolean lembrar
) {
}
