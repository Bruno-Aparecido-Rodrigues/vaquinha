package io.github.fatec.event;

import io.github.fatec.event.dto.CampanhaEvento;
import io.github.fatec.service.RelatorioService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.AmqpRejectAndDontRequeueException;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
public class CampanhaEventoEscutador {

    private static final Logger log = LoggerFactory.getLogger(CampanhaEventoEscutador.class);

    private final RelatorioService service;

    public CampanhaEventoEscutador(RelatorioService service) {
        this.service = service;
    }

    @RabbitListener(queues = "${event.campanha.queue}")
    public void receber(CampanhaEvento evento) {
        try {
            service.registrarEventoCampanha(evento);
            log.info("Evento de campanha registrado: {} ({})", evento.campanhaId(), evento.acao());
        } catch (Exception e) {
            log.error("Falha ao registrar evento da campanha {}: {}", evento.campanhaId(), e.getMessage());
            throw new AmqpRejectAndDontRequeueException("Falha ao registrar evento de campanha", e);
        }
    }
}