package io.github.fatec.repository;

import io.github.fatec.entity.User;
import io.github.fatec.repository.adapter.UserRepositoryImplAdapter;
import io.github.fatec.repository.client.UserRepositoryWithMongodb;
import io.github.fatec.repository.orm.UserOrm;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Repository;

@Repository
public class UserRepositoryImpl implements UserRepository {
    private final PasswordEncoder encoder;
    private final UserRepositoryWithMongodb repository;

    public UserRepositoryImpl(PasswordEncoder encoder, UserRepositoryWithMongodb repository) {
        this.encoder = encoder;
        this.repository = repository;
    }

    @Override
    public User save(User user) {
        if (repository.existsByEmail(user.email())) {
            throw new DuplicateKeyException("E-mail já cadastrado");
        }
        // A senha é gravada como hash BCrypt, nunca em texto puro
        UserOrm orm = repository.save(UserRepositoryImplAdapter.cast(user, encoder.encode(user.password())));
        return UserRepositoryImplAdapter.cast(orm);
    }

    @Override
    public User findByEmail(String email) {
        return repository.findByEmail(email)
                .map(UserRepositoryImplAdapter::cast)
                .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado"));
    }

    @Override
    public boolean existsByEmail(String email) {
        return repository.existsByEmail(email);
    }
}
