package io.github.fatec.controller.response;

import io.github.fatec.entity.enumerable.StatusCampanha;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

public record CampanhaResponse(
        String id,
        String titulo,
        String descricao,
        BigDecimal meta,
        BigDecimal valorArrecadado,
        Integer totalDoacoes,
        LocalDate dataLimite,
        Instant dataCriacao,
        String criadorId,
        String criadorNome,
        StatusCampanha status
) {
}