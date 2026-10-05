package io.github.fatec.repository.client;

import io.github.fatec.repository.orm.DoacaoOrm;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface DoacaoRepositoryWithMongodb extends MongoRepository<DoacaoOrm, String> {
    List<DoacaoOrm> findByCampanhaIdOrderByDataDesc(String campanhaId);
}