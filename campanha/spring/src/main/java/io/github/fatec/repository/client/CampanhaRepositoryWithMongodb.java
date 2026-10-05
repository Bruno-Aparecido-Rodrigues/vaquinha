package io.github.fatec.repository.client;

import io.github.fatec.repository.orm.CampanhaOrm;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CampanhaRepositoryWithMongodb extends MongoRepository<CampanhaOrm, String> {
    List<CampanhaOrm> findByAtivoTrue();
    Optional<CampanhaOrm> findByIdAndAtivoTrue(String id);
    List<CampanhaOrm> findByCriadorIdAndAtivoTrue(String criadorId);
}
