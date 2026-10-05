package io.github.fatec.repository.adapter;

import io.github.fatec.entity.Doacao;
import io.github.fatec.repository.orm.DoacaoOrm;

public class DoacaoRepositoryImplAdapter {

    private DoacaoRepositoryImplAdapter() {}

    public static DoacaoOrm cast(Doacao doacao) {
        return new DoacaoOrm(
                doacao.id(),
                doacao.operacaoId(),
                doacao.campanhaId(),
                doacao.doadorId(),
                doacao.doadorNome(),
                doacao.valor(),
                doacao.data()
        );
    }

    public static Doacao cast(DoacaoOrm orm) {
        return new Doacao(
                orm.id(),
                orm.operacaoId(),
                orm.campanhaId(),
                orm.doadorId(),
                orm.doadorNome(),
                orm.valor(),
                orm.data()
        );
    }
}