package io.github.fatec.controller.adapter;

import io.github.fatec.controller.request.CampanhaRequest;
import io.github.fatec.controller.request.CampanhaUpdateRequest;
import io.github.fatec.controller.response.CampanhaResponse;
import io.github.fatec.entity.Campanha;
import io.github.fatec.entity.enumerable.StatusCampanha;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

//Converte request -> Campanha e Campanha -> response.
public class CampanhaControllerAdapter {
    private CampanhaControllerAdapter() {
    }

    // Nova campanha: o sistema define id, data de criação, criador, status e começa com zero arrecadado.
    public static Campanha cast(CampanhaRequest request, String usuarioId, String usuarioNome) {
        return new Campanha(
                UUID.randomUUID().toString(),
                limpar(request.titulo()),
                limpar(request.descricao()),
                request.meta(),
                BigDecimal.ZERO,
                0,
                request.dataLimite(),
                Instant.now(),
                usuarioId,
                usuarioNome,
                StatusCampanha.ABERTA,
                true);
    }

    //Edição: só leva os campos editáveis os outros ficam nulos porque o service busca os valores verdadeiros no banco
    public static Campanha cast(CampanhaUpdateRequest request) {
        return new Campanha(
                request.id(),
                limpar(request.titulo()),
                limpar(request.descricao()),
                request.meta(),
                null,
                null,
                request.dataLimite(),
                null,
                null,
                null,
                null,
                true);
    }

    public static CampanhaResponse toResponse(Campanha campanha) {
        return new CampanhaResponse(
                campanha.id(),
                campanha.titulo(),
                campanha.descricao(),
                campanha.meta(),
                campanha.valorArrecadado(),
                campanha.totalDoacoes(),
                campanha.dataLimite(),
                campanha.dataCriacao(),
                campanha.criadorId(),
                campanha.criadorNome(),
                campanha.status());
    }

    // Tira espaços sobrando no começo e no fim do texto.
    private static String limpar(String texto) {
        return texto == null ? null : texto.trim();
    }
}