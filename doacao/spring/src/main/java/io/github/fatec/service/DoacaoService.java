package io.github.fatec.service;

import com.mongodb.MongoException;
import io.github.fatec.entity.CampanhaLocal;
import io.github.fatec.entity.Doacao;
import io.github.fatec.event.DoacaoPublicador;
import io.github.fatec.event.dto.DoacaoRealizadaEvento;
import io.github.fatec.event.dto.OperacaoEvento;
import io.github.fatec.event.dto.StatusOperacao;
import io.github.fatec.repository.CampanhaLocalRepository;
import io.github.fatec.repository.DoacaoRepository;
import io.github.fatec.service.dto.ResultadoDoacao;
import io.github.fatec.service.exception.DoacaoRecusadaException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;

// Orquestra a doação: valida, tenta até 5 vezes em caso de conflito e publica os eventos.
@Service
public class DoacaoService {

    private static final Logger log = LoggerFactory.getLogger(DoacaoService.class);
    private static final int MAX_TENTATIVAS = 5;
    private static final String TIPO = "DOACAO";

    private final RegistroDoacaoService registroDoacaoService;
    private final DoacaoRepository doacaoRepository;
    private final CampanhaLocalRepository campanhaLocalRepository;
    private final DoacaoPublicador publicador;

    public DoacaoService(RegistroDoacaoService registroDoacaoService,
                         DoacaoRepository doacaoRepository,
                         CampanhaLocalRepository campanhaLocalRepository,
                         DoacaoPublicador publicador) {
        this.registroDoacaoService = registroDoacaoService;
        this.doacaoRepository = doacaoRepository;
        this.campanhaLocalRepository = campanhaLocalRepository;
        this.publicador = publicador;
    }

    public ResultadoDoacao doar(String campanhaId, BigDecimal valor, String doadorId, String doadorNome) {
        // Validações de formato (400)
        if (campanhaId == null || campanhaId.isBlank()) {
            throw new IllegalArgumentException("Informe a vaquinha");
        }
        if (valor == null || valor.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("O valor da doação deve ser maior que zero");
        }
        if (valor.stripTrailingZeros().scale() > 2) {
            throw new IllegalArgumentException("O valor pode ter no máximo 2 casas decimais");
        }

        // A vaquinha existe na cópia? (404), e pega o título para o relatório
        String titulo = campanhaLocalRepository.findById(campanhaId)
                .map(CampanhaLocal::titulo)
                .orElseThrow(() -> new NoSuchElementException("Vaquinha não encontrada"));

        String operacaoId = UUID.randomUUID().toString();
        publicarStatus(operacaoId, StatusOperacao.PENDENTE, campanhaId, titulo, doadorNome, valor, 0, null);

        for (int tentativa = 1; tentativa <= MAX_TENTATIVAS; tentativa++) {
            publicarStatus(operacaoId, StatusOperacao.PROCESSANDO, campanhaId, titulo, doadorNome, valor, tentativa, null);

            try {
                ResultadoDoacao resultado = registroDoacaoService.registrar(
                        operacaoId, campanhaId, valor, doadorId, doadorNome);

                // Só chega aqui DEPOIS do commit: agora é seguro avisar os outros serviços
                Doacao doacao = resultado.doacao();
                publicador.publicarDoacaoRealizada(new DoacaoRealizadaEvento(
                        operacaoId, doacao.id(), campanhaId, valor, doadorId, doadorNome, doacao.data()));
                publicarStatus(operacaoId, StatusOperacao.CONCLUIDA, campanhaId, titulo, doadorNome, valor, tentativa, null);
                return resultado;

            } catch (DoacaoRecusadaException e) {
                publicarStatus(operacaoId, StatusOperacao.RECUSADA, campanhaId, titulo, doadorNome, valor, tentativa,
                        e.getMotivo().name());
                throw e;

            } catch (RuntimeException e) {
                if (!ehConflito(e)) {
                    publicarStatus(operacaoId, StatusOperacao.ERRO, campanhaId, titulo, doadorNome, valor, tentativa,
                            e.getMessage());
                    throw e;
                }
                log.warn("Conflito na doação {} (tentativa {}/{}): outra doação alterou a vaquinha {}",
                        operacaoId, tentativa, MAX_TENTATIVAS, campanhaId);
                publicarStatus(operacaoId, StatusOperacao.CONFLITO, campanhaId, titulo, doadorNome, valor, tentativa,
                        "Outra doação alterou a vaquinha ao mesmo tempo");
                esperar(tentativa);
            }
        }

        publicarStatus(operacaoId, StatusOperacao.ERRO, campanhaId, titulo, doadorNome, valor, MAX_TENTATIVAS,
                "Conflitos demais seguidos");
        throw new IllegalStateException("Muitas pessoas estão doando nesta vaquinha agora. Tente novamente em instantes.");
    }

    public List<Doacao> listarPorCampanha(String campanhaId) {
        return doacaoRepository.findByCampanhaId(campanhaId);
    }

    /** Conflito = outra transação mexeu na mesma vaquinha (pela versão ou pelo próprio Mongo). */
    private boolean ehConflito(Throwable erro) {
        for (Throwable t = erro; t != null; t = t.getCause()) {
            if (t instanceof OptimisticLockingFailureException) {
                return true;
            }
            if (t instanceof MongoException mongo
                    && (mongo.getCode() == 112
                    || mongo.hasErrorLabel(MongoException.TRANSIENT_TRANSACTION_ERROR_LABEL))) {
                return true;
            }
        }
        return false;
    }

    /** Espera um tempo aleatório e crescente para as doações em disputa não colidirem de novo. */
    private void esperar(int tentativa) {
        try {
            Thread.sleep(ThreadLocalRandom.current().nextLong(20, 80) * tentativa);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }

    private void publicarStatus(String operacaoId, StatusOperacao status, String campanhaId, String titulo,
                                String doadorNome, BigDecimal valor, int tentativa, String motivo) {
        publicador.publicarOperacao(new OperacaoEvento(
                operacaoId, TIPO, status, campanhaId, titulo, doadorNome, valor, tentativa, motivo, Instant.now()));
    }
}