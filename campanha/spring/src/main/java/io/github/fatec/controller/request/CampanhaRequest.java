package io.github.fatec.controller.request;

import java.math.BigDecimal;
import java.time.LocalDate;
public record CampanhaRequest (
        String titulo,
        String descricao,
        BigDecimal meta,
        LocalDate dataLimite
){
}
