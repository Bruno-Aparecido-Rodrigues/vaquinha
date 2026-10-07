package io.github.fatec.repository.adapter;

import io.github.fatec.entity.CampanhaLocal;
import io.github.fatec.repository.orm.CampanhaLocalOrm;

// Converte CampanhaLocal <-> CampanhaLocalOrm.
public class CampanhaLocalRepositoryImplAdapter {

    private CampanhaLocalRepositoryImplAdapter() {}

    public static CampanhaLocalOrm cast(CampanhaLocal campanha) {
        return new CampanhaLocalOrm(
                campanha.id(),
                campanha.titulo(),
                campanha.meta(),
                campanha.valorArrecadado(),
                campanha.dataLimite(),
                campanha.status(),
                campanha.ativo(),
                campanha.versao()
        );
    }

    public static CampanhaLocal cast(CampanhaLocalOrm orm) {
        return new CampanhaLocal(
                orm.id(),
                orm.titulo(),
                orm.meta(),
                orm.valorArrecadado(),
                orm.dataLimite(),
                orm.status(),
                orm.ativo(),
                orm.versao()
        );
    }
}