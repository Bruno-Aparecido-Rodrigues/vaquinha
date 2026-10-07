package io.github.fatec.controller.adapter;

import io.github.fatec.controller.response.OperacaoResponse;
import io.github.fatec.entity.Operacao;

// Converte Operacao em OperacaoResponse.
public class RelatorioControllerAdapter {

    private RelatorioControllerAdapter() {}

    public static OperacaoResponse cast(Operacao operacao) {
        return new OperacaoResponse(
                operacao.operacaoId(),
                operacao.tipo(),
                operacao.status().name(),
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
}