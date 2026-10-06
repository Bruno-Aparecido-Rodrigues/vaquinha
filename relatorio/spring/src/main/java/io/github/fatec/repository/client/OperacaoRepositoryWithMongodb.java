package io.github.fatec.repository.client;

import io.github.fatec.repository.orm.OperacaoOrm;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface OperacaoRepositoryWithMongodb extends MongoRepository<OperacaoOrm, String> {
    List<OperacaoOrm> findTop200ByOrderByInicioDesc();
}