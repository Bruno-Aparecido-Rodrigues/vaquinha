package io.github.fatec.service.dto;

import io.github.fatec.entity.CampanhaLocal;
import io.github.fatec.entity.Doacao;

public record ResultadoDoacao(
        Doacao doacao,
        CampanhaLocal campanha
) {}