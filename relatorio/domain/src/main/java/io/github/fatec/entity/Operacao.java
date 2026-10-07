package io.github.fatec.entity;

import io.github.fatec.entity.enumerable.StatusOperacao;

import java.math.BigDecimal;
import java.time.Instant;

// Uma linha do painel do ADMIN: uma operação de doação ou um evento de vaquinha.
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