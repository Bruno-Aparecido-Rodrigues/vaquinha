package io.github.fatec.repository.orm;

import io.github.fatec.entity.enumerable.StatusCampanha;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Version;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.FieldType;

import java.math.BigDecimal;
import java.time.LocalDate;

@Document("campanha_local")
public record CampanhaLocalOrm(
        @Id String id,
        String titulo,
        @Field(targetType = FieldType.DECIMAL128) BigDecimal meta,
        @Field(targetType = FieldType.DECIMAL128) BigDecimal valorArrecadado,
        LocalDate dataLimite,
        StatusCampanha status,
        boolean ativo,
        @Version Long versao
) {}