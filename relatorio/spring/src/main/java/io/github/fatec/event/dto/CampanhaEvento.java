package io.github.fatec.event.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

public record CampanhaEvento(
        String acao,
        String campanhaId,
        String titulo,
        BigDecimal meta,
        BigDecimal valorArrecadado,
        LocalDate dataLimite,
        String criadorId,
        String criadorNome,
        String status,
        boolean ativo,
        Instant data
) {}