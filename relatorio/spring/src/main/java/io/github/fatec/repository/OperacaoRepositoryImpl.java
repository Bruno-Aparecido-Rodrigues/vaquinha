package io.github.fatec.repository;

import io.github.fatec.entity.Operacao;
import io.github.fatec.repository.adapter.OperacaoRepositoryImplAdapter;
import io.github.fatec.repository.client.OperacaoRepositoryWithMongodb;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public class OperacaoRepositoryImpl implements OperacaoRepository {

    private final OperacaoRepositoryWithMongodb repository;

    public OperacaoRepositoryImpl(OperacaoRepositoryWithMongodb repository) {
        this.repository = repository;
    }

    @Override
    public Operacao save(Operacao operacao) {
        return OperacaoRepositoryImplAdapter.cast(
                repository.save(OperacaoRepositoryImplAdapter.cast(operacao)));
    }

    @Override
    public Optional<Operacao> findById(String operacaoId) {
        return repository.findById(operacaoId).map(OperacaoRepositoryImplAdapter::cast);
    }

    @Override
    public List<Operacao> findRecentes() {
        return repository.findTop200ByOrderByInicioDesc()
                .stream()
                .map(OperacaoRepositoryImplAdapter::cast)
                .toList();
    }
}