package io.github.fatec.repository.adapter;

import io.github.fatec.entity.User;
import io.github.fatec.repository.orm.UserOrm;

public class UserRepositoryImplAdapter {
    private UserRepositoryImplAdapter() {
    }

    public static User cast(UserOrm orm) {
        return new User(
                orm.id(),
                orm.nome(),
                orm.email(),
                orm.password(),
                orm.roles());
    }

    /**
     * Converte para ORM usando a senha já criptografada (hash) informada.
     */
    public static UserOrm cast(User user, String passwordHash) {
        return new UserOrm(
                user.id(),
                user.nome(),
                user.email(),
                passwordHash,
                user.roles());
    }
}
