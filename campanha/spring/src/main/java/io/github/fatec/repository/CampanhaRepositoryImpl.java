package io.github.fatec.repository;

import io.github.fatec.entity.Campanha;
import io.github.fatec.entity.enumerable.StatusCampanha;
import io.github.fatec.repository.adapter.CampanhaRepositoryImplAdapter;
import io.github.fatec.repository.client.CampanhaRepositoryWithMongodb;
import io.github.fatec.repository.orm.CampanhaOrm;
import org.bson.types.Decimal128;
import org.springframework.data.mongodb.core.FindAndModifyOptions;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.NoSuchElementException;

//Acesso ao MongoDB, consultas simples pelo client e $set/$inc pelo MongoTemplate.
@Repository
public class CampanhaRepositoryImpl implements CampanhaRepository {
    private final CampanhaRepositoryWithMongodb repository;
    private final MongoTemplate mongoTemplate;

    public CampanhaRepositoryImpl(CampanhaRepositoryWithMongodb repository, MongoTemplate mongoTemplate) {
        this.repository = repository;
        this.mongoTemplate = mongoTemplate;
    }

    @Override
    public Campanha save(Campanha campanha) {
        CampanhaOrm orm = repository.save(CampanhaRepositoryImplAdapter.cast(campanha));
        return CampanhaRepositoryImplAdapter.cast(orm);
    }

    /**
     * Atualiza SÓ os campos que o dono pode editar.
     * valorArrecadado e totalDoacoes não são tocados aqui, porque quem mexe neles
     * são as doações (método registrarDoacao).
     */
    @Override
    public Campanha update(Campanha campanha) {
        Query query = new Query(Criteria.where("_id").is(campanha.id()).and("ativo").is(true));
        Update update = new Update()
                .set("titulo", campanha.titulo())
                .set("descricao", campanha.descricao())
                .set("meta", new Decimal128(campanha.meta()))
                .set("dataLimite", campanha.dataLimite())
                .set("status", campanha.status().name());

        if (mongoTemplate.updateFirst(query, update, CampanhaOrm.class).getMatchedCount() == 0) {
            throw new NoSuchElementException("Campanha não encontrada: " + campanha.id());
        }
        return findById(campanha.id());
    }

    //Exclusão lógica, o documento continua no banco, só fica com ativo = false.
    @Override
    public void delete(String id) {
        Query query = new Query(Criteria.where("_id").is(id).and("ativo").is(true));
        Update update = new Update().set("ativo", false);

        if (mongoTemplate.updateFirst(query, update, CampanhaOrm.class).getMatchedCount() == 0) {
            throw new NoSuchElementException("Campanha não encontrada: " + id);
        }
    }

    @Override
    public List<Campanha> findAll() {
        return repository.findByAtivoTrue().stream()
                .map(CampanhaRepositoryImplAdapter::cast)
                .toList();
    }

    @Override
    public Campanha findById(String id) {
        return repository.findByIdAndAtivoTrue(id)
                .map(CampanhaRepositoryImplAdapter::cast)
                .orElseThrow(() -> new NoSuchElementException("Campanha não encontrada: " + id));
    }

    @Override
    public List<Campanha> findByCriadorId(String criadorId) {
        return repository.findByCriadorIdAndAtivoTrue(criadorId).stream()
                .map(CampanhaRepositoryImplAdapter::cast)
                .toList();
    }

    /**
     * Soma uma doação de forma ATÔMICA: o próprio MongoDB faz
     * "valorArrecadado = valorArrecadado + valor" e "totalDoacoes = totalDoacoes + 1"
     * numa única operação ($inc). Assim, duas doações chegando juntas nunca
     * sobrescrevem uma à outra.
     */
    @Override
    public void registrarDoacao(String campanhaId, BigDecimal valor) {
        Query query = new Query(Criteria.where("_id").is(campanhaId));
        Update update = new Update()
                .inc("valorArrecadado", new Decimal128(valor))
                .inc("totalDoacoes", 1);

        CampanhaOrm atualizada = mongoTemplate.findAndModify(
                query, update, FindAndModifyOptions.options().returnNew(true), CampanhaOrm.class);

        if (atualizada == null) {
            throw new NoSuchElementException("Campanha não encontrada: " + campanhaId);
        }

        // Se com essa doação a meta foi alcançada, muda o status
        if (atualizada.status() == StatusCampanha.ABERTA
                && atualizada.valorArrecadado().compareTo(atualizada.meta()) >= 0) {
            mongoTemplate.updateFirst(
                    new Query(Criteria.where("_id").is(campanhaId).and("status").is(StatusCampanha.ABERTA.name())),
                    new Update().set("status", StatusCampanha.META_ATINGIDA.name()),
                    CampanhaOrm.class);
        }
    }
}