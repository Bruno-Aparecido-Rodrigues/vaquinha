package io.github.fatec.repository;

import io.github.fatec.entity.CampanhaLocal;
import io.github.fatec.repository.adapter.CampanhaLocalRepositoryImplAdapter;
import io.github.fatec.repository.client.CampanhaLocalRepositoryWithMongodb;
import io.github.fatec.repository.orm.CampanhaLocalOrm;
import org.bson.types.Decimal128;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.Optional;

@Repository
public class CampanhaLocalRepositoryImpl implements CampanhaLocalRepository {

    private final CampanhaLocalRepositoryWithMongodb repository;
    private final MongoTemplate mongoTemplate;

    public CampanhaLocalRepositoryImpl(CampanhaLocalRepositoryWithMongodb repository,
                                       MongoTemplate mongoTemplate) {
        this.repository = repository;
        this.mongoTemplate = mongoTemplate;
    }

    @Override
    public Optional<CampanhaLocal> findById(String id) {
        return repository.findById(id).map(CampanhaLocalRepositoryImplAdapter::cast);
    }

    @Override
    public CampanhaLocal save(CampanhaLocal campanha) {
        // Por causa do @Version, só grava se a versao ainda for a que foi lida.
        // Se outra doação passou na frente, lança OptimisticLockingFailureException.
        return CampanhaLocalRepositoryImplAdapter.cast(
                repository.save(CampanhaLocalRepositoryImplAdapter.cast(campanha)));
    }

    @Override
    public void sincronizar(CampanhaLocal campanha) {
        BigDecimal arrecadadoInicial = campanha.valorArrecadado() != null
                ? campanha.valorArrecadado()
                : BigDecimal.ZERO;

        Query query = Query.query(Criteria.where("_id").is(campanha.id()));

        Update update = new Update()
                .set("titulo", campanha.titulo())
                .set("meta", new Decimal128(campanha.meta()))
                .set("dataLimite", campanha.dataLimite())
                .set("status", campanha.status().name())
                .set("ativo", campanha.ativo())
                .setOnInsert("valorArrecadado", new Decimal128(arrecadadoInicial))
                .inc("versao", 1L);

        mongoTemplate.upsert(query, update, CampanhaLocalOrm.class);
    }
}