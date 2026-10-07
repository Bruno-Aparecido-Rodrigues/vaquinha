package io.github.fatec.repository;

import io.github.fatec.entity.Doacao;
import io.github.fatec.repository.adapter.DoacaoRepositoryImplAdapter;
import io.github.fatec.repository.client.DoacaoRepositoryWithMongodb;
import org.springframework.stereotype.Repository;

import java.util.List;

// Acesso ao MongoDB das doações.
@Repository
public class DoacaoRepositoryImpl implements DoacaoRepository {

    private final DoacaoRepositoryWithMongodb repository;

    public DoacaoRepositoryImpl(DoacaoRepositoryWithMongodb repository) {
        this.repository = repository;
    }

    @Override
    public Doacao save(Doacao doacao) {
        return DoacaoRepositoryImplAdapter.cast(
                repository.save(DoacaoRepositoryImplAdapter.cast(doacao)));
    }

    @Override
    public List<Doacao> findByCampanhaId(String campanhaId) {
        return repository.findByCampanhaIdOrderByDataDesc(campanhaId)
                .stream()
                .map(DoacaoRepositoryImplAdapter::cast)
                .toList();
    }
}