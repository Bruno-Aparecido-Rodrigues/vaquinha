package io.github.fatec.repository.client;

import io.github.fatec.repository.orm.CampanhaLocalOrm;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface CampanhaLocalRepositoryWithMongodb extends MongoRepository<CampanhaLocalOrm, String> {
}