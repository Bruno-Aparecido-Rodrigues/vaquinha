package io.github.fatec.event.dto;

// Etapas de uma operação: pendente, processando, conflito, concluída, recusada, erro.
public enum StatusOperacao {
    PENDENTE,
    PROCESSANDO,
    CONFLITO,
    CONCLUIDA,
    RECUSADA,
    ERRO
}