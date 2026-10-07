package io.github.fatec.repository.client;

import io.github.fatec.repository.orm.DoacaoOrm;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

// Consultas automáticas do Spring Data para as doações
public interface DoacaoRepositoryWithMongodb extends MongoRepository<DoacaoOrm, String> {
    List<DoacaoOrm> findByCampanhaIdOrderByDataDesc(String campanhaId);
}