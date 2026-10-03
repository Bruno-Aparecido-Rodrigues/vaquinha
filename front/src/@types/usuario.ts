export type Perfil = 'ADMIN' | 'CLIENTE';

// Resposta do serviço de Login (o token NÃO vem aqui: ele fica no cookie HttpOnly)
export type Usuario = {
    id: string;
    nome: string;
    email: string;
    roles: Perfil[];
};
