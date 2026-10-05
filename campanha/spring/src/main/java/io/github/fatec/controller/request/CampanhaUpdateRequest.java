package io.github.fatec.controller.request;

import java.math.BigDecimal;
import java.time.LocalDate;

public record CampanhaUpdateRequest(
        String id,
        String titulo,
        String descricao,
        BigDecimal meta,
        LocalDate dataLimite
) {
}