package io.github.fatec.repository.orm;

import io.github.fatec.entity.enumerable.UserRole;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Document(collection = "usuario")
public record UserOrm(
        @Id
        String id,
        String nome,
        @Indexed(unique = true)
        String email,
        String password,
        List<UserRole> roles
) {
}
