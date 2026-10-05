package io.github.fatec.controller.adapter;

import io.github.fatec.controller.response.DoacaoItemResponse;
import io.github.fatec.controller.response.DoacaoResponse;
import io.github.fatec.entity.CampanhaLocal;
import io.github.fatec.entity.Doacao;
import io.github.fatec.service.dto.ResultadoDoacao;

import java.math.BigDecimal;

public class DoacaoControllerAdapter {

    private DoacaoControllerAdapter() {}

    public static DoacaoItemResponse cast(Doacao doacao) {
        return new DoacaoItemResponse(
                doacao.id(),
                doacao.campanhaId(),
                doacao.doadorNome(),
                doacao.valor(),
                doacao.data()
        );
    }

    public static DoacaoResponse cast(ResultadoDoacao resultado) {
        CampanhaLocal campanha = resultado.campanha();
        BigDecimal restante = campanha.meta()
                .subtract(campanha.valorArrecadado())
                .max(BigDecimal.ZERO);

        return new DoacaoResponse(
                resultado.doacao().operacaoId(),
                "CONCLUIDA",
                cast(resultado.doacao()),
                campanha.valorArrecadado(),
                restante
        );
    }
}