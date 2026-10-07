package io.github.fatec.repository.client;

import io.github.fatec.repository.orm.CampanhaLocalOrm;
import org.springframework.data.mongodb.repository.MongoRepository;

// CRUD pronto do Spring Data para a cópia local (findById, save).
public interface CampanhaLocalRepositoryWithMongodb extends MongoRepository<CampanhaLocalOrm, String> {
}