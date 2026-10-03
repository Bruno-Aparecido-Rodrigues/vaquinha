import { createApi } from './httpClient';
import { Usuario } from '@/@types/usuario';

const authApi = createApi('/login');

export async function apiLogin(email: string, senha: string, lembrar: boolean): Promise<Usuario> {
    const res = await authApi.post<Usuario>('/auth', { email, senha, lembrar });
    return res.data;
}

/** Cadastro público: o backend sempre cria como CLIENTE e já devolve o cookie. */
export async function apiRegister(nome: string, email: string, senha: string): Promise<Usuario> {
    const res = await authApi.post<Usuario>('/v1/create', { nome, email, senha });
    return res.data;
}

/** Quem está logado? (o gateway lê o cookie). Lança erro 401 se não houver sessão. */
export async function apiMe(): Promise<Usuario> {
    const res = await authApi.get<Usuario>('/v1/me');
    return res.data;
}

/** O cookie é HttpOnly, então só o backend consegue apagá-lo. */
export async function apiLogout(): Promise<void> {
    await authApi.post('/v1/logout');
}
