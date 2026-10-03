import axios, { AxiosInstance } from 'axios';

type UnauthorizedHandler = () => void;

let onUnauthorized: UnauthorizedHandler | null = null;

/** O AuthContext registra aqui o que fazer quando a sessão expira (401). */
export function setUnauthorizedHandler(handler: UnauthorizedHandler | null) {
    onUnauthorized = handler;
}

// Todas as chamadas vão para o API Gateway (porta 8080).
const GATEWAY_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8080';

/**
 * withCredentials: true faz o navegador enviar o cookie access_token em toda requisição
 * e aceitar o Set-Cookie que vem do login. O token nunca passa pelo JavaScript.
 */
export function createApi(path: string): AxiosInstance {
    const instance = axios.create({
        baseURL: `${GATEWAY_URL}${path}`,
        withCredentials: true,
        timeout: 15000,
    });

    instance.interceptors.response.use(
        (response) => response,
        (error) => {
            const url: string = error?.config?.url ?? '';
            const rotaDeAuth = url.includes('/auth') || url.includes('/v1/me') || url.includes('/v1/create');
            if (error?.response?.status === 401 && !rotaDeAuth) {
                onUnauthorized?.();
            }
            return Promise.reject(error);
        }
    );
    return instance;
}
