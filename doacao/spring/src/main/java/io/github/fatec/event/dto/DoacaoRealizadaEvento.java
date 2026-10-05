package io.github.fatec.event.dto;

import java.math.BigDecimal;
import java.time.Instant;

public record DoacaoRealizadaEvento(
        String operacaoId,
        String doacaoId,
        String campanhaId,
        BigDecimal valor,
        String doadorId,
        String doadorNome,
        Instant data
) {}