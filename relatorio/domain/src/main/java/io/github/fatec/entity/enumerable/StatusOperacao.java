package io.github.fatec.entity.enumerable;

// Status de uma operação, finalizado() diz se ela já terminou.
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