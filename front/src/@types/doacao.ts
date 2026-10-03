export type Doacao = {
    id: string;
    campanhaId: string;
    doadorNome: string;
    valor: number;
    data: string; // ISO 8601
};

export type DoacaoRequest = {
    campanhaId: string;
    valor: number;
};

// 201 - doação confirmada (transação concluída)
export type DoacaoResponse = {
    operacaoId: string;
    status: 'CONCLUIDA';
    doacao: Doacao;
    valorArrecadado: number;
    valorRestante: number;
};

// Motivos de recusa devolvidos pelo serviço de Doação (409 / 422)
export type MotivoRecusa =
    | 'META_ATINGIDA'        // outra doação completou a meta antes
    | 'VALOR_EXCEDE_META'    // o valor passa do que falta
    | 'CAMPANHA_ENCERRADA'
    | 'PRAZO_ENCERRADO';

export type DoacaoErro = {
    mensagem: string;
    motivo?: MotivoRecusa;
    valorRestante?: number;
    operacaoId?: string;
};
