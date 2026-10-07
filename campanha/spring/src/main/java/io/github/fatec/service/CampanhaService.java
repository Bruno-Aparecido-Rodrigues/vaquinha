package io.github.fatec.service;

import io.github.fatec.entity.Campanha;
import io.github.fatec.entity.enumerable.StatusCampanha;
import io.github.fatec.event.CampanhaPublicador;
import io.github.fatec.repository.CampanhaRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

// Regras de negócio da vaquinha, validar, criar, editar, excluir e somar doações.
@Service
public class CampanhaService {
    private static final int TITULO_MAX = 80;

    private final CampanhaRepository repository;
    private final CampanhaPublicador publicador;

    public CampanhaService(CampanhaRepository repository, CampanhaPublicador publicador) {
        this.repository = repository;
        this.publicador = publicador;
    }

    // ---------------- Consultas ----------------

    public List<Campanha> listar() {
        return repository.findAll();
    }

    public Campanha buscar(String id) {
        return repository.findById(id);
    }

    public List<Campanha> minhas(String usuarioId) {
        return repository.findByCriadorId(usuarioId);
    }

    // ---------------- CRUD ----------------

    public Campanha criar(Campanha nova) {
        validar(nova);
        Campanha salva = repository.save(nova);
        publicador.criada(salva);
        return salva;
    }

    public Campanha atualizar(Campanha dados, String usuarioId) {
        Campanha atual = buscarDoDono(dados.id(), usuarioId);

        if (atual.status() == StatusCampanha.ENCERRADA) {
            throw new IllegalStateException("Campanhas encerradas não podem ser editadas");
        }
        validar(dados);
        if (dados.meta().compareTo(atual.valorArrecadado()) < 0) {
            throw new IllegalStateException(
                    "A meta não pode ser menor que o valor já arrecadado (R$ " + atual.valorArrecadado() + ")");
        }

        // Se a nova meta for igual ao que já foi arrecadado, a meta foi atingida;
        // se o dono aumentou a meta, a campanha volta a aceitar doações.
        StatusCampanha status = dados.meta().compareTo(atual.valorArrecadado()) <= 0
                ? StatusCampanha.META_ATINGIDA
                : StatusCampanha.ABERTA;

        Campanha alterada = new Campanha(
                atual.id(),
                dados.titulo(),
                dados.descricao(),
                dados.meta(),
                atual.valorArrecadado(),   // continua o valor do banco
                atual.totalDoacoes(),      // continua o valor do banco
                dados.dataLimite(),
                atual.dataCriacao(),
                atual.criadorId(),
                atual.criadorNome(),
                status,
                true);

        Campanha salva = repository.update(alterada);
        publicador.atualizada(salva);
        return salva;
    }

    public void excluir(String id, String usuarioId) {
        Campanha atual = buscarDoDono(id, usuarioId);

        if (atual.totalDoacoes() > 0) {
            throw new IllegalStateException(
                    "Campanhas que já receberam doações não podem ser excluídas");
        }

        repository.delete(id);
        publicador.excluida(comStatus(atual, atual.status(), false));
    }

    /** Chamado quando chega a mensagem doacao.realizada (passo 9). */
    public void registrarDoacao(String campanhaId, BigDecimal valor) {
        repository.registrarDoacao(campanhaId, valor);
    }

    // ---------------- Regras auxiliares ----------------

    /** Busca a campanha e garante que quem está pedindo é o dono dela. */
    private Campanha buscarDoDono(String id, String usuarioId) {
        Campanha campanha = repository.findById(id);
        if (!campanha.criadorId().equals(usuarioId)) {
            throw new SecurityException("Somente quem criou a vaquinha pode alterá-la");
        }
        return campanha;
    }

    private void validar(Campanha c) {
        if (c.titulo() == null || c.titulo().trim().length() < 3) {
            throw new IllegalArgumentException("O título deve ter pelo menos 3 caracteres");
        }
        if (c.titulo().trim().length() > TITULO_MAX) {
            throw new IllegalArgumentException("O título pode ter no máximo " + TITULO_MAX + " caracteres");
        }
        if (c.descricao() == null || c.descricao().trim().length() < 10) {
            throw new IllegalArgumentException("Conte a história da vaquinha na descrição (mínimo de 10 caracteres)");
        }
        if (c.meta() == null || c.meta().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("A meta deve ser maior que zero");
        }
        if (c.dataLimite() == null || c.dataLimite().isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("A data limite não pode estar no passado");
        }
    }

    /** Cria uma cópia da campanha mudando só o status e o ativo (records não podem ser alterados). */
    private Campanha comStatus(Campanha c, StatusCampanha status, boolean ativo) {
        return new Campanha(
                c.id(), c.titulo(), c.descricao(), c.meta(), c.valorArrecadado(), c.totalDoacoes(),
                c.dataLimite(), c.dataCriacao(), c.criadorId(), c.criadorNome(), status, ativo);
    }
}