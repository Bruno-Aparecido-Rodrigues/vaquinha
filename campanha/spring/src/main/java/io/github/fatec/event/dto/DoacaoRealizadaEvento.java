package io.github.fatec.event.dto;

import java.math.BigDecimal;
import java.time.Instant;

// Mensagem recebida da Doação quando uma doação é concluída.
public record DoacaoRealizadaEvento(
        String operacaoId,
        String doacaoId,
        String campanhaId,
        BigDecimal valor,
        String doadorId,
        String doadorNome,
        Instant data
) {
}