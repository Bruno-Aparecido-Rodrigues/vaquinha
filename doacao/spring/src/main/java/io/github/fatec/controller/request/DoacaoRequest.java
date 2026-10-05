package io.github.fatec.controller.request;

import java.math.BigDecimal;

public record DoacaoRequest(
        String campanhaId,
        BigDecimal valor
) {}
