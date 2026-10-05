package io.github.fatec.repository;

import io.github.fatec.entity.Doacao;

import java.util.List;

public interface DoacaoRepository {
    Doacao save(Doacao doacao);
    List<Doacao> findByCampanhaId(String campanhaId);
}
