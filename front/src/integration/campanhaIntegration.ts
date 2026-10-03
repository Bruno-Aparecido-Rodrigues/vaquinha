import { createApi } from './httpClient';
import { Campanha, CampanhaRequest, CampanhaUpdateRequest } from '@/@types/campanha';

const campanhaApi = createApi('/campanha');

export async function listarCampanhas(): Promise<Campanha[]> {
    const res = await campanhaApi.get<Campanha[]>('/all');
    return res.data;
}

export async function buscarCampanha(id: string): Promise<Campanha> {
    const res = await campanhaApi.get<Campanha>(`/${id}`);
    return res.data;
}

/** Campanhas do usuário logado (o serviço sabe quem é pelo cabeçalho X-User-Id do gateway). */
export async function listarMinhasCampanhas(): Promise<Campanha[]> {
    const res = await campanhaApi.get<Campanha[]>('/minhas');
    return res.data;
}

export async function criarCampanha(request: CampanhaRequest): Promise<Campanha> {
    const res = await campanhaApi.post<Campanha>('/save', request);
    return res.data;
}

export async function atualizarCampanha(request: CampanhaUpdateRequest): Promise<Campanha> {
    const res = await campanhaApi.put<Campanha>('/update', request);
    return res.data;
}

export async function encerrarCampanha(id: string): Promise<Campanha> {
    const res = await campanhaApi.put<Campanha>(`/encerrar/${id}`);
    return res.data;
}

export async function excluirCampanha(id: string): Promise<void> {
    await campanhaApi.delete(`/delete/${id}`);
}
