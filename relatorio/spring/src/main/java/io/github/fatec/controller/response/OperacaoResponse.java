package io.github.fatec.controller.response;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.math.BigDecimal;
import java.time.Instant;

@JsonInclude(JsonInclude.Include.NON_NULL)
// campos do tipo Operacao do front
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