package io.github.fatec.repository;

import io.github.fatec.entity.Operacao;

import java.util.List;
import java.util.Optional;

public interface OperacaoRepository {
    Operacao save(Operacao operacao);
    Optional<Operacao> findById(String operacaoId);
    List<Operacao> findRecentes();
}