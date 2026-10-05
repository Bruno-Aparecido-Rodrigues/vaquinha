package io.github.fatec.repository.orm;

import io.github.fatec.entity.enumerable.StatusCampanha;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.FieldType;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Document(collection = "campanha") //define que cada campanha vira um documento na colecao campanha
public record CampanhaOrm(
    @Id //o campo vira _id no documento no mongo.
    String id,
    String titulo,
    String descricao,
    @Field(targetType = FieldType.DECIMAL128) //grava no mongo como ecimal, para representar dinheiro
    BigDecimal meta,
    @Field(targetType = FieldType.DECIMAL128)
    BigDecimal valorArrecadado,
    Integer totalDoacoes,
    LocalDate dataLimite,
    Instant dataCriacao,
    @Indexed //cria inice no banco para facilitar campanhas de uma determinada pessoa
    String criadorId,
    String criadorNome,
    StatusCampanha status,
    boolean ativo
){

}
