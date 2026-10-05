package io.github.fatec.event.dto;

import java.math.BigDecimal;
import java.time.Instant;

public record OperacaoEvento(
        String operacaoId,
        String tipo,
        StatusOperacao status,
        String campanhaId,
        String campanhaTitulo,
        String usuarioNome,
        BigDecimal valor,
        Integer tentativas,
        String motivo,
        Instant data
) {}