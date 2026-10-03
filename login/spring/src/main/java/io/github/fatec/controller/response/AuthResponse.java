package io.github.fatec.controller.response;

import java.util.List;

/** O token NÃO volta no corpo: ele vai apenas no cookie HttpOnly. */
public record AuthResponse(
        String id,
        String nome,
        String email,
        List<String> roles
) {
}
