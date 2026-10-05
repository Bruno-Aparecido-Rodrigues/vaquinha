package io.github.fatec.repository;

import io.github.fatec.entity.CampanhaLocal;

import java.util.Optional;

public interface CampanhaLocalRepository {
    Optional<CampanhaLocal> findById(String id);
    CampanhaLocal save(CampanhaLocal campanha);
    void sincronizar(CampanhaLocal campanha);
}