package io.github.fatec.repository.adapter;

import io.github.fatec.entity.Campanha;
import io.github.fatec.repository.orm.CampanhaOrm;

public class CampanhaRepositoryImplAdapter {
    private CampanhaRepositoryImplAdapter() {
    }

    public static Campanha cast(CampanhaOrm orm) {
        return new Campanha(
                orm.id(),
                orm.titulo(),
                orm.descricao(),
                orm.meta(),
                orm.valorArrecadado(),
                orm.totalDoacoes(),
                orm.dataLimite(),
                orm.dataCriacao(),
                orm.criadorId(),
                orm.criadorNome(),
                orm.status(),
                orm.ativo());
    }

    public static CampanhaOrm cast(Campanha campanha) {
        return new CampanhaOrm(
                campanha.id(),
                campanha.titulo(),
                campanha.descricao(),
                campanha.meta(),
                campanha.valorArrecadado(),
                campanha.totalDoacoes(),
                campanha.dataLimite(),
                campanha.dataCriacao(),
                campanha.criadorId(),
                campanha.criadorNome(),
                campanha.status(),
                campanha.ativo());
    }
}