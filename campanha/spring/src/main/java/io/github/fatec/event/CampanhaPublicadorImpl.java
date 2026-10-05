package io.github.fatec.event;

import io.github.fatec.entity.Campanha;
import io.github.fatec.event.dto.CampanhaEvento;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.time.Instant;

@Component
public class CampanhaPublicadorImpl implements CampanhaPublicador {
    private static final Logger logger = LoggerFactory.getLogger(CampanhaPublicadorImpl.class);

    private final RabbitTemplate rabbitTemplate;
    private final String exchange;

    public CampanhaPublicadorImpl(RabbitTemplate rabbitTemplate, @Value("${event.exchange}") String exchange) {
        this.rabbitTemplate = rabbitTemplate;
        this.exchange = exchange;
    }

    @Override
    public void criada(Campanha campanha) {
        publicar("campanha.criada", "CRIADA", campanha);
    }

    @Override
    public void atualizada(Campanha campanha) {
        publicar("campanha.atualizada", "ATUALIZADA", campanha);
    }

    @Override
    public void encerrada(Campanha campanha) {
        publicar("campanha.encerrada", "ENCERRADA", campanha);
    }

    @Override
    public void excluida(Campanha campanha) {
        publicar("campanha.excluida", "EXCLUIDA", campanha);
    }

    private void publicar(String routingKey, String acao, Campanha campanha) {
        CampanhaEvento evento = new CampanhaEvento(
                acao,
                campanha.id(),
                campanha.titulo(),
                campanha.meta(),
                campanha.valorArrecadado(),
                campanha.dataLimite(),
                campanha.criadorId(),
                campanha.criadorNome(),
                campanha.status(),
                campanha.ativo(),
                Instant.now());
        try {
            rabbitTemplate.convertAndSend(exchange, routingKey, evento);
            logger.info("Evento publicado: {} -> {}", routingKey, campanha.id());
        } catch (Exception ex) {
            // A campanha já foi salva no banco; uma falha no RabbitMQ não desfaz o CRUD
            logger.error("Falha ao publicar {} da campanha {}: {}", routingKey, campanha.id(), ex.getMessage());
        }
    }
}