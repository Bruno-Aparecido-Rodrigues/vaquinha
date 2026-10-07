package io.github.fatec.configuration;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

// Configura o RabbitMQ: exchange, conversor JSON e a fila de eventos das vaquinhas.
@Configuration
public class RabbitMQConfig {

    @Value("${event.exchange}")
    private String exchange;

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

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory, MessageConverter messageConverter) {
        RabbitTemplate rabbitTemplate = new RabbitTemplate(connectionFactory);
        rabbitTemplate.setMessageConverter(messageConverter);
        return rabbitTemplate;
    }

    @Bean
    public Queue campanhaEventosQueue() {
        return new Queue(campanhaQueue, true);
    }

    @Bean
    public Binding campanhaEventosBinding(Queue campanhaEventosQueue, TopicExchange vaquinhaExchange) {
        return BindingBuilder.bind(campanhaEventosQueue)
                .to(vaquinhaExchange)
                .with(campanhaRoutingKey);
    }
}