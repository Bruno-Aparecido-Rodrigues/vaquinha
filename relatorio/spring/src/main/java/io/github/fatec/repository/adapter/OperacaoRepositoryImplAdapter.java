package io.github.fatec.repository.adapter;

import io.github.fatec.entity.Operacao;
import io.github.fatec.repository.orm.OperacaoOrm;

/** Converte Operacao <-> OperacaoOrm. */
public class OperacaoRepositoryImplAdapter {

    private OperacaoRepositoryImplAdapter() {}

    public static OperacaoOrm cast(Operacao operacao) {
        return new OperacaoOrm(
                operacao.operacaoId(),
                operacao.tipo(),
                operacao.status(),
                operacao.campanhaId(),
                operacao.campanhaTitulo(),
                operacao.usuarioNome(),
                operacao.valor(),
                operacao.tentativas(),
                operacao.motivo(),
                operacao.inicio(),
                operacao.fim()
        );
    }

    public static Operacao cast(OperacaoOrm orm) {
        return new Operacao(
                orm.operacaoId(),
                orm.tipo(),
                orm.status(),
                orm.campanhaId(),
                orm.campanhaTitulo(),
                orm.usuarioNome(),
                orm.valor(),
                orm.tentativas(),
                orm.motivo(),
                orm.inicio(),
                orm.fim()
        );
    }
}