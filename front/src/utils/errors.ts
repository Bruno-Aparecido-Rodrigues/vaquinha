import axios from 'axios';

/** Extrai a mensagem de erro devolvida pelos serviços ({ mensagem: "..." }). */
export function mensagemErro(e: unknown, padrao = 'Algo deu errado. Tente novamente.'): string {
    if (axios.isAxiosError(e)) {
        if (!e.response) {
            return 'Não foi possível conectar ao servidor. Verifique se o gateway está rodando.';
        }
        const data = e.response.data as { mensagem?: string; message?: string } | string | undefined;
        if (typeof data === 'string' && data.trim()) return data;
        if (data && typeof data === 'object') {
            if (data.mensagem) return data.mensagem;
        }
        if (e.response.status === 401) return 'Sua sessão expirou. Entre novamente.';
        if (e.response.status === 403) return 'Você não tem permissão para esta ação.';
    }
    return padrao;
}

export function statusHttp(e: unknown): number | undefined {
    return axios.isAxiosError(e) ? e.response?.status : undefined;
}
