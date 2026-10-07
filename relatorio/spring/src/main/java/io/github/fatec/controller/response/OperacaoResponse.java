package io.github.fatec.controller.response;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.math.BigDecimal;
import java.time.Instant;

/** Uma linha do painel no formato que o front espera (campos nulos não vão no JSON). */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record OperacaoResponse(
        String operacaoId,
        String tipo,
        String status,
        String campanhaId,
        String campanhaTitulo,
        String usuarioNome,
        BigDecimal valor,
        Integer tentativas,
        String motivo,
        Instant inicio,
        Instant fim
) {}