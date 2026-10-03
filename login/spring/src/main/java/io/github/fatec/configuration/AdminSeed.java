package io.github.fatec.configuration;

import io.github.fatec.entity.User;
import io.github.fatec.entity.enumerable.UserRole;
import io.github.fatec.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;

/**
 * O site só cria contas CLIENTE. A única conta ADMIN é criada aqui
 * quando o serviço sobe (somente se ainda não existir).
 */
@Component
public class AdminSeed implements ApplicationRunner {
    private static final Logger logger = LoggerFactory.getLogger(AdminSeed.class);

    private final UserRepository repository;
    private final String nome;
    private final String email;
    private final String senha;

    public AdminSeed(
            UserRepository repository,
            @Value("${app.admin.nome}") String nome,
            @Value("${app.admin.email}") String email,
            @Value("${app.admin.senha}") String senha) {
        this.repository = repository;
        this.nome = nome;
        this.email = email;
        this.senha = senha;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (!repository.existsByEmail(email)) {
            repository.save(new User(UUID.randomUUID().toString(), nome, email, senha, List.of(UserRole.ADMIN)));
            logger.info("Usuário ADMIN padrão criado: {}", email);
        }
    }
}
