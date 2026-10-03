export type StatusOperacao =
    | 'PENDENTE'
    | 'PROCESSANDO'
    | 'CONFLITO'
    | 'CONCLUIDA'
    | 'RECUSADA'
    | 'ERRO';

// Uma linha do monitor do admin. O serviço de Relatório monta isso a partir
// dos eventos recebidos pelo RabbitMQ (um documento por operacaoId).
export type Operacao = {
    operacaoId: string;
    tipo: string; // DOACAO, CAMPANHA_CRIADA, CAMPANHA_ATUALIZADA, CAMPANHA_ENCERRADA, CAMPANHA_EXCLUIDA
    status: StatusOperacao;
    campanhaId?: string;
    campanhaTitulo?: string;
    usuarioNome?: string;
    valor?: number;
    tentativas?: number;
    motivo?: string;
    inicio: string;  // ISO 8601
    fim?: string;    // ISO 8601
};
