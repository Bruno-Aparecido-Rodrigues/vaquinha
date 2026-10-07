package io.github.fatec.configuration;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

// Configura o RabbitMQ, as duas filas do Relatório (operações e eventos das vaquinhas)
@Configuration
public class RabbitMQConfig {

    @Value("${event.exchange}")
    private String exchange;

    @Value("${event.operacao.queue}")
    private String operacaoQueue;

    @Value("${event.operacao.routing-key}")
    private String operacaoRoutingKey;

    @Value("${event.campanha.queue}")
    private String campanhaQueue;

    @Value("${event.campanha.routing-key}")
    private String campanhaRoutingKey;

    @Bean
    public TopicExchange vaquinhaExchange() {
        return new TopicExchange(exchange);
    }

    @Bean
    public MessageConverter messageConverter(ObjectMapper objectMapper) {
        return new Jackson2JsonMessageConverter(objectMapper);
    }

    // Status operações (Doação)

    @Bean
    public Queue operacoesQueue() {
        return new Queue(operacaoQueue, true);
    }

    @Bean
    public Binding operacoesBinding() {
        return BindingBuilder.bind(operacoesQueue())
                .to(vaquinhaExchange())
                .with(operacaoRoutingKey);
    }

    // Eventos de vaquinha (Campanha)

    @Bean
    public Queue campanhaEventosQueue() {
        return new Queue(campanhaQueue, true);
    }

    @Bean
    public Binding campanhaEventosBinding() {
        return BindingBuilder.bind(campanhaEventosQueue())
                .to(vaquinhaExchange())
                .with(campanhaRoutingKey);
    }
}