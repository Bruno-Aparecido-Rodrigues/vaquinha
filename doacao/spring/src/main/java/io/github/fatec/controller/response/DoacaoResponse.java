package io.github.fatec.controller.response;

import java.math.BigDecimal;

// Resposta da doação, status, total arrecadado e quanto falta.
public record DoacaoResponse(
        String operacaoId,
        String status,
        DoacaoItemResponse doacao,
        BigDecimal valorArrecadado,
        BigDecimal valorRestante
) {}