package io.github.fatec.controller.response;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.math.BigDecimal;

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