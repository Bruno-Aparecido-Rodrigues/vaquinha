package io.github.fatec.event;

import io.github.fatec.event.dto.DoacaoRealizadaEvento;
import io.github.fatec.event.dto.OperacaoEvento;

// Contrato para publicar a doação realizada e o andamento de cada operação.
public interface DoacaoPublicador {
    void publicarDoacaoRealizada(DoacaoRealizadaEvento evento);
    void publicarOperacao(OperacaoEvento evento);
}