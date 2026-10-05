package io.github.fatec.event;

import io.github.fatec.event.dto.DoacaoRealizadaEvento;
import io.github.fatec.event.dto.OperacaoEvento;

public interface DoacaoPublicador {
    void publicarDoacaoRealizada(DoacaoRealizadaEvento evento);
    void publicarOperacao(OperacaoEvento evento);
}