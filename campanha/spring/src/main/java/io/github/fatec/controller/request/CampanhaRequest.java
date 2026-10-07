package io.github.fatec.controller.request;

import java.math.BigDecimal;
import java.time.LocalDate;
// Corpo do POST /campanha/save (criar vaquinha).
public record CampanhaRequest (
        String titulo,
        String descricao,
        BigDecimal meta,
        LocalDate dataLimite
){
}
