import { createApi } from './httpClient';
import { Doacao, DoacaoResponse } from '@/@types/doacao';

const doacaoApi = createApi('/doacao');

/**
 * Faz a doação. É aqui que entram a concorrência e a transação no backend:
 * se outra pessoa doar ao mesmo tempo e a meta encher, a resposta é 409.
 */
export async function doar(campanhaId: string, valor: number): Promise<DoacaoResponse> {
    const res = await doacaoApi.post<DoacaoResponse>('', { campanhaId, valor });
    return res.data;
}

export async function listarDoacoesDaCampanha(campanhaId: string): Promise<Doacao[]> {
    const res = await doacaoApi.get<Doacao[]>(`/campanha/${campanhaId}`);
    return res.data;
}
