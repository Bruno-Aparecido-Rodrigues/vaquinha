package io.github.fatec.event;

import io.github.fatec.event.dto.DoacaoRealizadaEvento;
import io.github.fatec.event.dto.OperacaoEvento;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class DoacaoPublicadorImpl implements DoacaoPublicador {

    private static final Logger log = LoggerFactory.getLogger(DoacaoPublicadorImpl.class);

    private final RabbitTemplate rabbitTemplate;

    @Value("${event.exchange}")
    private String exchange;

    @Value("${event.doacao-realizada.routing-key}")
    private String doacaoRealizadaRoutingKey;

    @Value("${event.operacao.routing-key}")
    private String operacaoRoutingKey;

    public DoacaoPublicadorImpl(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    @Override
    public void publicarDoacaoRealizada(DoacaoRealizadaEvento evento) {
        try {
            rabbitTemplate.convertAndSend(exchange, doacaoRealizadaRoutingKey, evento);
            log.info("Publicado {}: doação {} de {} na campanha {}",
                    doacaoRealizadaRoutingKey, evento.doacaoId(), evento.valor(), evento.campanhaId());
        } catch (Exception e) {
            log.error("Falha ao publicar doação realizada {}: {}", evento.doacaoId(), e.getMessage());
        }
    }

    @Override
    public void publicarOperacao(OperacaoEvento evento) {
        try {
            rabbitTemplate.convertAndSend(exchange, operacaoRoutingKey, evento);
            log.info("Operação {} -> {} (tentativa {})",
                    evento.operacaoId(), evento.status(), evento.tentativas());
        } catch (Exception e) {
            log.error("Falha ao publicar operação {}: {}", evento.operacaoId(), e.getMessage());
        }
    }
}