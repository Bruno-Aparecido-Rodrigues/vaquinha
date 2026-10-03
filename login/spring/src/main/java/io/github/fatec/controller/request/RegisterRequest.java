package io.github.fatec.controller.request;

/** Cadastro feito pela tela "Criar conta". */
public record RegisterRequest(
        String nome,
        String email,
        String senha
) {
}
