package io.github.fatec.repository;

import io.github.fatec.entity.User;

public interface UserRepository {
    User save(User user);
    User findByEmail(String email);
    boolean existsByEmail(String email);
}
