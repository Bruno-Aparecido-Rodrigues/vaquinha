export type StatusCampanha = 'ABERTA' | 'META_ATINGIDA' | 'ENCERRADA';

export type Campanha = {
    id: string;
    titulo: string;
    descricao: string;
    imagemUrl: string;
    meta: number;
    valorArrecadado: number;
    totalDoacoes: number;
    dataLimite: string;   // yyyy-MM-dd
    dataCriacao: string;  // ISO 8601
    criadorId: string;
    criadorNome: string;
    status: StatusCampanha;
};

export type CampanhaRequest = {
    titulo: string;
    descricao: string;
    meta: number;
    dataLimite: string;   // yyyy-MM-dd
    imagemUrl: string;
};

export type CampanhaUpdateRequest = CampanhaRequest & {
    id: string;
};
