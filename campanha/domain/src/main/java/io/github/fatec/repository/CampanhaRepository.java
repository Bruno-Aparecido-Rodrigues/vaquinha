package io.github.fatec.repository;

import io.github.fatec.entity.Campanha;

import java.math.BigDecimal;
import java.util.List;

// Contrato do banco de vaquinhas, quem implementa é o CampanhaRepositoryImpl.
public interface CampanhaRepository {
    Campanha save(Campanha campanha);
    Campanha update(Campanha campanha);
    void delete(String id);
    List<Campanha> findAll();
    Campanha findById(String id);
    List<Campanha> findByCriadorId(String criadorId);
    void registrarDoacao(String campanhaId, BigDecimal valor);
}
