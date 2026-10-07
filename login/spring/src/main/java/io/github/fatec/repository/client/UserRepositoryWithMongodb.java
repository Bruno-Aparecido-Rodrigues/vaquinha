package io.github.fatec.repository.client;

import io.github.fatec.repository.orm.UserOrm;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/** Consultas automáticas do Spring Data (busca por e-mail). */
@Repository
public interface UserRepositoryWithMongodb extends MongoRepository<UserOrm, String> {
    Optional<UserOrm> findByEmail(String email);
    boolean existsByEmail(String email);
}
