package io.github.fatec.repository.orm;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.FieldType;

import java.math.BigDecimal;
import java.time.Instant;

@Document("doacao")
public record DoacaoOrm(
        @Id String id,
        @Indexed(unique = true) String operacaoId,
        @Indexed String campanhaId,
        String doadorId,
        String doadorNome,
        @Field(targetType = FieldType.DECIMAL128) BigDecimal valor,
        Instant data
) {}