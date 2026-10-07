package io.github.fatec.event;

import io.github.fatec.entity.Campanha;
// Contrato para avisar que uma vaquinha foi criada, atualizada ou excluída.
public interface CampanhaPublicador {
    void criada(Campanha campanha);
    void atualizada(Campanha campanha);
    void excluida(Campanha campanha);
}
