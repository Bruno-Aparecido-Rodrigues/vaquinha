package io.github.fatec.event.dto;

import io.github.fatec.entity.enumerable.StatusCampanha;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

// Mensagem recebida da Campanha (criada, atualizada, excluída).
public record CampanhaEvento(
        String acao,
        String campanhaId,
        String titulo,
        BigDecimal meta,
        BigDecimal valorArrecadado,
        LocalDate dataLimite,
        String criadorId,
        String criadorNome,
        StatusCampanha status,
        boolean ativo,
        Instant data
) {}