package io.github.fatec.configuration;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;

@Configuration
public class RabbitMQConfig {
    //Exchange do tipo TOPIC: todos os serviços publicam nela e cada serviço
    //interessado liga a SUA fila, escolhendo quais mensagens quer receber, Pub/Sub
    @Bean
    public TopicExchange eventosExchange(@Value("${event.exchange}") String exchange) {
        return new TopicExchange(exchange, true, false);
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

    // Fila própria da Campanha para receber as doações confirmadas.
    @Bean
    public Queue doacaoRealizadaQueue(@Value("${event.doacao-realizada.queue}") String queue) {
        return new Queue(queue, true);
    }

    // Inscreve a fila na exchange, só recebe mensagens com a etiqueta "doacao.realizada".
    @Bean
    public Binding doacaoRealizadaBinding(
            Queue doacaoRealizadaQueue,
            TopicExchange eventosExchange,
            @Value("${event.doacao-realizada.routing-key}") String routingKey) {
        return BindingBuilder.bind(doacaoRealizadaQueue).to(eventosExchange).with(routingKey);
    }
}