package io.github.fatec.entity;

import java.math.BigDecimal;
import java.time.Instant;

public record Doacao(
        String id,
        String operacaoId,
        String campanhaId,
        String doadorId,
        String doadorNome,
        BigDecimal valor,
        Instant data
) {}