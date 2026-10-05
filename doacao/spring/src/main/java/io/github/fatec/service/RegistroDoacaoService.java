package io.github.fatec.service;

import io.github.fatec.entity.CampanhaLocal;
import io.github.fatec.entity.Doacao;
import io.github.fatec.entity.enumerable.MotivoRecusa;
import io.github.fatec.entity.enumerable.StatusCampanha;
import io.github.fatec.repository.CampanhaLocalRepository;
import io.github.fatec.repository.DoacaoRepository;
import io.github.fatec.service.dto.ResultadoDoacao;
import io.github.fatec.service.exception.DoacaoRecusadaException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.NoSuchElementException;

@Service
public class RegistroDoacaoService {

    private final DoacaoRepository doacaoRepository;
    private final CampanhaLocalRepository campanhaLocalRepository;

    public RegistroDoacaoService(DoacaoRepository doacaoRepository,
                                 CampanhaLocalRepository campanhaLocalRepository) {
        this.doacaoRepository = doacaoRepository;
        this.campanhaLocalRepository = campanhaLocalRepository;
    }

    @Transactional
    public ResultadoDoacao registrar(String operacaoId, String campanhaId, BigDecimal valor,
                                     String doadorId, String doadorNome) {

        // 1. Lê a cópia local (junto vem a versao)
        CampanhaLocal campanha = campanhaLocalRepository.findById(campanhaId)
                .orElseThrow(() -> new NoSuchElementException("Vaquinha não encontrada"));

        // 2. Regras de negócio: lança DoacaoRecusadaException se não puder doar
        validar(campanha, valor);

        // 3. Soma o valor na cópia (o save confere a versao)
        BigDecimal novoTotal = campanha.valorArrecadado().add(valor);
        StatusCampanha novoStatus = novoTotal.compareTo(campanha.meta()) >= 0
                ? StatusCampanha.META_ATINGIDA
                : campanha.status();

        CampanhaLocal atualizada = campanhaLocalRepository.save(new CampanhaLocal(
                campanha.id(),
                campanha.titulo(),
                campanha.meta(),
                novoTotal,
                campanha.dataLimite(),
                novoStatus,
                campanha.ativo(),
                campanha.versao()
        ));

        // 4. Grava a doação
        Doacao doacao = doacaoRepository.save(new Doacao(
                null,
                operacaoId,
                campanhaId,
                doadorId,
                doadorNome,
                valor,
                Instant.now()
        ));

        return new ResultadoDoacao(doacao, atualizada);
    }

    private void validar(CampanhaLocal campanha, BigDecimal valor) {
        BigDecimal restante = campanha.meta()
                .subtract(campanha.valorArrecadado())
                .max(BigDecimal.ZERO);

        if (!campanha.ativo() || campanha.status() == StatusCampanha.ENCERRADA) {
            throw new DoacaoRecusadaException(MotivoRecusa.CAMPANHA_ENCERRADA, restante,
                    "Esta vaquinha foi encerrada e não aceita mais doações");
        }
        if (campanha.dataLimite() != null && campanha.dataLimite().isBefore(LocalDate.now())) {
            throw new DoacaoRecusadaException(MotivoRecusa.PRAZO_ENCERRADO, restante,
                    "O prazo desta vaquinha já terminou");
        }
        if (restante.signum() == 0) {
            throw new DoacaoRecusadaException(MotivoRecusa.META_ATINGIDA, restante,
                    "A meta desta vaquinha já foi atingida");
        }
        if (valor.compareTo(restante) > 0) {
            throw new DoacaoRecusadaException(MotivoRecusa.VALOR_EXCEDE_META, restante,
                    "O valor é maior do que falta para a meta. Faltam R$ " + restante);
        }
    }
}