import { createApi } from './httpClient';
import { Operacao } from '@/@types/relatorio';

const relatorioApi = createApi('/relatorio');

/** Somente ADMIN (o gateway bloqueia para os outros perfis). */
export async function listarOperacoes(): Promise<Operacao[]> {
    const res = await relatorioApi.get<Operacao[]>('/operacoes');
    return res.data;
}
