package io.github.fatec.controller.request;

import java.math.BigDecimal;
import java.time.LocalDate;

// Corpo do PUT /campanha/update (editar vaquinha)
public record CampanhaUpdateRequest(
        String id,
        String titulo,
        String descricao,
        BigDecimal meta,
        LocalDate dataLimite
) {
}