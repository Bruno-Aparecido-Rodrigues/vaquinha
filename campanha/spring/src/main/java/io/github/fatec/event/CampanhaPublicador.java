package io.github.fatec.event;

import io.github.fatec.entity.Campanha;
public interface CampanhaPublicador {
    void criada(Campanha campanha);
    void atualizada(Campanha campanha);
    void encerrada(Campanha campanha);
    void excluida(Campanha campanha);
}
