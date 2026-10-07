package io.github.fatec.repository.orm;

import io.github.fatec.entity.enumerable.StatusOperacao;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.FieldType;

import java.math.BigDecimal;
import java.time.Instant;

// Documento da coleção "operacao"; o id é o próprio operacaoId.
@Document("operacao")
public record OperacaoOrm(
        @Id String operacaoId,
        String tipo,
        StatusOperacao status,
        String campanhaId,
        String campanhaTitulo,
        String usuarioNome,
        @Field(targetType = FieldType.DECIMAL128) BigDecimal valor,
        Integer tentativas,
        String motivo,
        @Indexed Instant inicio,
        Instant fim
) {}