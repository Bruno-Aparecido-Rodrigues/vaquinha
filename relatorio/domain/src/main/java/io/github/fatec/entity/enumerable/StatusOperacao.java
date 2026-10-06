package io.github.fatec.entity.enumerable;

public enum StatusOperacao {
    PENDENTE,
    PROCESSANDO,
    CONFLITO,
    CONCLUIDA,
    RECUSADA,
    ERRO;

    public boolean finalizado() {
        return this == CONCLUIDA || this == RECUSADA || this == ERRO;
    }
}