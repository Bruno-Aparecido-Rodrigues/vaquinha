package io.github.fatec.entity;

import io.github.fatec.entity.enumerable.UserRole;

import java.util.List;

// Usuário cadastrado: nome, e-mail, senha e perfis.
public record User(
        String id,
        String nome,
        String email,
        String password,
        List<UserRole> roles
) {
}
