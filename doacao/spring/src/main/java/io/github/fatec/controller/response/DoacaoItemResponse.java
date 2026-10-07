package io.github.fatec.controller.response;

import java.math.BigDecimal;
import java.time.Instant;

// Uma doação na lista da página da vaquinha.
public record DoacaoItemResponse(
        String id,
        String campanhaId,
        String doadorNome,
        BigDecimal valor,
        Instant data
) {}