package io.github.fatec.entity;

// E-mail e senha digitados na tela de login.
public record Login(
        String email,
        String password
) {
}
