package io.github.fatec.service;

import io.github.fatec.entity.Operacao;
import io.github.fatec.entity.enumerable.StatusOperacao;
import io.github.fatec.event.dto.CampanhaEvento;
import io.github.fatec.event.dto.OperacaoEvento;
import io.github.fatec.repository.OperacaoRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class RelatorioService {

    private static final Logger log = LoggerFactory.getLogger(RelatorioService.class);

    private final OperacaoRepository repository;

    public RelatorioService(OperacaoRepository repository) {
        this.repository = repository;
    }

    // Status de uma doação: atualiza a mesma linha a cada evento.
    public void registrarOperacao(OperacaoEvento evento) {
        if (evento.operacaoId() == null || evento.status() == null) {
            throw new IllegalArgumentException("Evento de operação incompleto: " + evento);
        }

        Instant data = evento.data() != null ? evento.data() : Instant.now();
        Optional<Operacao> existente = repository.findById(evento.operacaoId());

        // Uma operação finalizada nunca "volta" (ex.: PROCESSANDO atrasado depois de CONCLUIDA)
        if (existente.isPresent() && existente.get().status().finalizado()) {
            log.warn("Operação {} já está {}; evento {} ignorado",
                    evento.operacaoId(), existente.get().status(), evento.status());
            return;
        }

        Instant inicio = existente.map(Operacao::inicio).orElse(data);
        int tentativas = Math.max(
                existente.map(Operacao::tentativas).orElse(0),
                evento.tentativas() != null ? evento.tentativas() : 0);
        Instant fim = evento.status().finalizado() ? data : null;

        repository.save(new Operacao(
                evento.operacaoId(),
                evento.tipo(),
                evento.status(),
                evento.campanhaId(),
                evento.campanhaTitulo(),
                evento.usuarioNome(),
                evento.valor(),
                tentativas,
                evento.motivo(),
                inicio,
                fim
        ));
    }

    // Evento de vaquinha (criada, atualizada...): vira uma linha já concluída.
    public void registrarEventoCampanha(CampanhaEvento evento) {
        if (evento.acao() == null) {
            throw new IllegalArgumentException("Evento de campanha sem ação: " + evento);
        }

        Instant data = evento.data() != null ? evento.data() : Instant.now();

        repository.save(new Operacao(
                UUID.randomUUID().toString(),
                "CAMPANHA_" + evento.acao(),
                StatusOperacao.CONCLUIDA,
                evento.campanhaId(),
                evento.titulo(),
                evento.criadorNome(),
                null,
                1,
                null,
                data,
                data
        ));
    }

    public List<Operacao> listarOperacoes() {
        return repository.findRecentes();
    }
}