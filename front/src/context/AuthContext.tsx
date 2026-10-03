import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { apiLogin, apiLogout, apiMe, apiRegister } from '@/integration/authIntegration';
import { setUnauthorizedHandler } from '@/integration/httpClient';
import { Usuario } from '@/@types/usuario';
import { mensagemErro, statusHttp } from '@/utils/errors';

type Resultado = { ok: boolean; usuario?: Usuario; error?: string };

type AuthContextData = {
    usuario: Usuario | null;
    isAuthenticated: boolean;
    isAdmin: boolean;
    isLoading: boolean;
    signIn: (email: string, senha: string, lembrar: boolean) => Promise<Resultado>;
    signUp: (nome: string, email: string, senha: string) => Promise<Resultado>;
    signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

/**
 * Diferente do projeto da pokedex, aqui o token NÃO fica no AsyncStorage:
 * ele vive só no cookie HttpOnly, que o navegador guarda e envia sozinho.
 * O front guarda apenas os dados do usuário (nome, e-mail, perfis) em memória.
 */
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [usuario, setUsuario] = useState<Usuario | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Ao abrir o site: se o cookie ainda for válido, o /me devolve o usuário
    useEffect(() => {
        let ativo = true;
        apiMe()
            .then(u => { if (ativo) setUsuario(u); })
            .catch(() => { if (ativo) setUsuario(null); })
            .finally(() => { if (ativo) setIsLoading(false); });
        return () => { ativo = false; };
    }, []);

    // Qualquer 401 em outra rota = cookie expirou -> volta para o login
    useEffect(() => {
        setUnauthorizedHandler(() => setUsuario(null));
        return () => setUnauthorizedHandler(null);
    }, []);

    const signIn = useCallback(async (email: string, senha: string, lembrar: boolean): Promise<Resultado> => {
        if (!email.trim() || !senha) {
            return { ok: false, error: 'Preencha e-mail e senha.' };
        }
        try {
            const u = await apiLogin(email.trim().toLowerCase(), senha, lembrar);
            setUsuario(u);
            return { ok: true, usuario: u };
        } catch (e) {
            const status = statusHttp(e);
            const error = status === 401 ? 'E-mail ou senha incorretos.' : mensagemErro(e);
            return { ok: false, error };
        }
    }, []);

    const signUp = useCallback(async (nome: string, email: string, senha: string): Promise<Resultado> => {
        try {
            const u = await apiRegister(nome.trim(), email.trim().toLowerCase(), senha);
            setUsuario(u);
            return { ok: true, usuario: u };
        } catch (e) {
            return { ok: false, error: mensagemErro(e, 'Não foi possível criar a conta.') };
        }
    }, []);

    const signOut = useCallback(async () => {
        try {
            await apiLogout();
        } catch {
            // mesmo se o backend falhar, limpa a sessão local
        }
        setUsuario(null);
    }, []);

    const value = useMemo<AuthContextData>(() => ({
        usuario,
        isAuthenticated: usuario !== null,
        isAdmin: usuario?.roles.includes('ADMIN') ?? false,
        isLoading,
        signIn,
        signUp,
        signOut,
    }), [usuario, isLoading, signIn, signUp, signOut]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
