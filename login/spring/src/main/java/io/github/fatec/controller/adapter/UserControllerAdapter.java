package io.github.fatec.controller.adapter;

import io.github.fatec.controller.request.RegisterRequest;
import io.github.fatec.entity.User;
import io.github.fatec.entity.enumerable.UserRole;

import java.util.List;
import java.util.UUID;

public class UserControllerAdapter {
    private UserControllerAdapter() {
    }

    /** Cadastro feito pela tela "Criar conta": toda conta nova é CLIENTE. */
    public static User cast(RegisterRequest request) {
        validarNome(request.nome());
        String email = validarEmail(request.email());
        validarSenha(request.senha());
        return new User(
                UUID.randomUUID().toString(),
                request.nome().trim(),
                email,
                request.senha(),
                List.of(UserRole.CLIENTE));
    }

    private static void validarNome(String nome) {
        if (nome == null || nome.isBlank()) {
            throw new IllegalArgumentException("Informe o nome");
        }
    }

    private static String validarEmail(String email) {
        if (email == null || !email.trim().matches("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$")) {
            throw new IllegalArgumentException("E-mail inválido");
        }
        return email.trim().toLowerCase();
    }

    private static void validarSenha(String senha) {
        if (senha == null || senha.length() < 6) {
            throw new IllegalArgumentException("A senha deve ter no mínimo 6 caracteres");
        }
    }
}
