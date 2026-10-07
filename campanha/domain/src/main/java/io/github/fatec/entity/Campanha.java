package io.github.fatec.entity;

import  io.github.fatec.entity.enumerable.StatusCampanha;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

//dados do negócio
public record Campanha (
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
    StatusCampanha status,
    boolean ativo
){

}
