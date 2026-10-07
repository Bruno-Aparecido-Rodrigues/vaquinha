package io.github.fatec.event.dto;

import io.github.fatec.entity.enumerable.StatusOperacao;

import java.math.BigDecimal;
import java.time.Instant;

// Mensagem recebida da Doação com o status de uma operação.
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