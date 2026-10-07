package io.github.fatec.controller.response;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.math.BigDecimal;

// Corpo das respostas de erro (com motivo e valor restante quando é recusa).
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ErrorResponse(
        String mensagem,
        String motivo,
        BigDecimal valorRestante
) {
    public ErrorResponse(String mensagem) {
        this(mensagem, null, null);
    }
}