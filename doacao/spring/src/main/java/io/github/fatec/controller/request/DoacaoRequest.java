package io.github.fatec.controller.request;

import java.math.BigDecimal;

// Corpo do POST /doacao: vaquinha e valor.
public record DoacaoRequest(
        String campanhaId,
        BigDecimal valor
) {}
