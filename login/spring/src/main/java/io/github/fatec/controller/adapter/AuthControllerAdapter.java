package io.github.fatec.controller.adapter;

import io.github.fatec.controller.request.LoginRequest;
import io.github.fatec.controller.response.AuthResponse;
import io.github.fatec.entity.Login;
import io.github.fatec.entity.User;

public class AuthControllerAdapter {
    private AuthControllerAdapter() {
    }

    public static Login cast(LoginRequest request) {
        String email = request.email() == null ? "" : request.email().trim().toLowerCase();
        String senha = request.senha() == null ? "" : request.senha();
        return new Login(email, senha);
    }

    public static AuthResponse toResponse(User user) {
        return new AuthResponse(
                user.id(),
                user.nome(),
                user.email(),
                user.roles().stream().map(Enum::name).toList());
    }
}
