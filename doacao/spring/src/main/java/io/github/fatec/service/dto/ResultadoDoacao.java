package io.github.fatec.service.dto;

import io.github.fatec.entity.CampanhaLocal;
import io.github.fatec.entity.Doacao;

// Resultado de uma tentativa que deu certo: a doação e a vaquinha atualizada.
public record ResultadoDoacao(
        Doacao doacao,
        CampanhaLocal campanha
) {}