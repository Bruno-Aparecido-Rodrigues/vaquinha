package io.github.fatec.event.dto;

import java.math.BigDecimal;
import java.time.Instant;

// Mensagem enviada à Campanha para somar a doação no total.
public record DoacaoRealizadaEvento(
        String operacaoId,
        String doacaoId,
        String campanhaId,
        BigDecimal valor,
        String doadorId,
        String doadorNome,
        Instant data
) {}