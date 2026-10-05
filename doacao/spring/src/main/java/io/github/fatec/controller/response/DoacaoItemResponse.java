package io.github.fatec.controller.response;

import java.math.BigDecimal;
import java.time.Instant;

public record DoacaoItemResponse(
        String id,
        String campanhaId,
        String doadorNome,
        BigDecimal valor,
        Instant data
) {}