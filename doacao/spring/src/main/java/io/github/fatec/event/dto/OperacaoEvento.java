package io.github.fatec.event.dto;

import java.math.BigDecimal;
import java.time.Instant;

// Mensagem enviada ao Relatório com o status atual de uma operação de doação.
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