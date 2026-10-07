package io.github.fatec.event;

import io.github.fatec.event.dto.DoacaoRealizadaEvento;
import io.github.fatec.service.CampanhaService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.AmqpRejectAndDontRequeueException;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Component;

// Escuta a fila campanha.doacao-realizada e soma a doação no total da vaquinha.
@Component
public class DoacaoRealizadaEscutador {
    private static final Logger logger = LoggerFactory.getLogger(DoacaoRealizadaEscutador.class);

    private final CampanhaService service;

    public DoacaoRealizadaEscutador(CampanhaService service) {
        this.service = service;
    }

    @RabbitListener(queues = "${event.doacao-realizada.queue}")
    public void processar(@Payload DoacaoRealizadaEvento evento) {
        logger.info("Doação recebida: R$ {} para a campanha {}", evento.valor(), evento.campanhaId());
        try {
            service.registrarDoacao(evento.campanhaId(), evento.valor());
        } catch (Exception ex) {
            // Sem isso, o RabbitMQ devolveria a mensagem para a fila e ela
            // seria entregue de novo infinitamente, travando a fila.
            logger.error("Não foi possível registrar a doação {}: {}", evento.doacaoId(), ex.getMessage());
            throw new AmqpRejectAndDontRequeueException(ex);
        }
    }
}