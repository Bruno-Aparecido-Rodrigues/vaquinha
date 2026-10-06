package io.github.fatec.entity;

import io.github.fatec.entity.enumerable.StatusOperacao;

import java.math.BigDecimal;
import java.time.Instant;

public record Operacao(
        String operacaoId,
        String tipo,
        StatusOperacao status,
        String campanhaId,
        String campanhaTitulo,
        String usuarioNome,
        BigDecimal valor,
        Integer tentativas,
        String motivo,
        Instant inicio,
        Instant fim
) {}