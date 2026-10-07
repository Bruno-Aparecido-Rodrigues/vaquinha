package io.github.fatec.service;

import io.github.fatec.entity.CampanhaLocal;
import io.github.fatec.event.dto.CampanhaEvento;
import io.github.fatec.repository.CampanhaLocalRepository;
import org.springframework.stereotype.Service;

// Transforma o evento recebido da Campanha em cópia local atualizada.
@Service
public class CampanhaLocalService {

    private final CampanhaLocalRepository repository;

    public CampanhaLocalService(CampanhaLocalRepository repository) {
        this.repository = repository;
    }

    public void sincronizar(CampanhaEvento evento) {
        if (evento.campanhaId() == null || evento.meta() == null || evento.status() == null) {
            throw new IllegalArgumentException("Evento de campanha incompleto: " + evento);
        }

        CampanhaLocal campanha = new CampanhaLocal(
                evento.campanhaId(),
                evento.titulo(),
                evento.meta(),
                evento.valorArrecadado(),
                evento.dataLimite(),
                evento.status(),
                evento.ativo(),
                null
        );

        repository.sincronizar(campanha);
    }
}