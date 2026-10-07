package io.github.fatec.service.exception;

import io.github.fatec.entity.enumerable.MotivoRecusa;

import java.math.BigDecimal;

// Doação recusada por regra de negócio; carrega o motivo e o valor restante.
public class DoacaoRecusadaException extends RuntimeException {

    private final MotivoRecusa motivo;
    private final BigDecimal valorRestante;

    public DoacaoRecusadaException(MotivoRecusa motivo, BigDecimal valorRestante, String mensagem) {
        super(mensagem);
        this.motivo = motivo;
        this.valorRestante = valorRestante;
    }

    public MotivoRecusa getMotivo() {
        return motivo;
    }

    public BigDecimal getValorRestante() {
        return valorRestante;
    }
}