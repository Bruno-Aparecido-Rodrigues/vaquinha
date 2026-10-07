package io.github.fatec.entity;

import io.github.fatec.entity.enumerable.StatusCampanha;

import java.math.BigDecimal;
import java.time.LocalDate;

// Cópia local da vaquinha (meta, total, prazo, status) mantida pelas mensagens da Campanha
public record CampanhaLocal(
        String id,
        String titulo,
        BigDecimal meta,
        BigDecimal valorArrecadado,
        LocalDate dataLimite,
        StatusCampanha status,
        boolean ativo,
        Long versao
) {}