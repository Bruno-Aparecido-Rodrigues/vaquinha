package io.github.fatec.controller.response;

import java.math.BigDecimal;

public record DoacaoResponse(
        String operacaoId,
        String status,
        DoacaoItemResponse doacao,
        BigDecimal valorArrecadado,
        BigDecimal valorRestante
) {}