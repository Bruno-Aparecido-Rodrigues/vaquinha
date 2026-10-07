package io.github.fatec.event;

import io.github.fatec.event.dto.CampanhaEvento;
import io.github.fatec.service.CampanhaLocalService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.AmqpRejectAndDontRequeueException;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

// Escuta a fila doacao.campanha-eventos e atualiza a cópia local da vaquinha.
@Component
public class CampanhaEventoEscutador {

    private static final Logger log = LoggerFactory.getLogger(CampanhaEventoEscutador.class);

    private final CampanhaLocalService service;

    public CampanhaEventoEscutador(CampanhaLocalService service) {
        this.service = service;
    }

    @RabbitListener(queues = "${event.campanha.queue}")
    public void receber(CampanhaEvento evento) {
        try {
            service.sincronizar(evento);
            log.info("Cópia local sincronizada: campanha {} ({})", evento.campanhaId(), evento.acao());
        } catch (Exception e) {
            log.error("Falha ao sincronizar campanha {}: {}", evento.campanhaId(), e.getMessage());
            throw new AmqpRejectAndDontRequeueException("Falha ao sincronizar campanha", e);
        }
    }
}