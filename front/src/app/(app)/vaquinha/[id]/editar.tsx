import React, { useCallback, useEffect, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import Screen from '@/components/screen';
import CampanhaForm from '@/components/campanha-form';
import Button from '@/components/button';
import { EmptyView, ErrorView, LoadingView } from '@/components/state-views';
import { Campanha } from '@/@types/campanha';
import { buscarCampanha } from '@/integration/campanhaIntegration';
import { useAuth } from '@/context/AuthContext';
import { mensagemErro } from '@/utils/errors';

export default function EditarVaquinha() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { usuario } = useAuth();
    const [campanha, setCampanha] = useState<Campanha | null>(null);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState<string | null>(null);

    const carregar = useCallback(async () => {
        if (!id) return;
        setErro(null);
        setCarregando(true);
        try {
            setCampanha(await buscarCampanha(id));
        } catch (e) {
            setErro(mensagemErro(e, 'Não foi possível carregar a vaquinha.'));
        } finally {
            setCarregando(false);
        }
    }, [id]);

    useEffect(() => { carregar(); }, [carregar]);

    const voltar = (
        <Button title="Voltar para Minhas Vaquinhas" variante="tonal" icone="arrow-back"
                onPress={() => router.replace('/minhas-vaquinhas')} />
    );

    let conteudo: React.ReactNode;
    if (carregando) {
        conteudo = <LoadingView />;
    } else if (erro || !campanha) {
        conteudo = <ErrorView mensagem={erro ?? 'Vaquinha não encontrada.'} onRetry={carregar} />;
    } else if (campanha.criadorId !== usuario?.id) {
        conteudo = <EmptyView icone="lock" titulo="Você não pode editar esta vaquinha"
                              descricao="Somente quem criou a vaquinha pode alterar os dados dela." acao={voltar} />;
    } else if (campanha.status === 'ENCERRADA') {
        conteudo = <EmptyView icone="lock" titulo="Vaquinha encerrada"
                              descricao="Campanhas encerradas não podem mais ser editadas." acao={voltar} />;
    } else {
        conteudo = <CampanhaForm campanha={campanha} />;
    }

    return <Screen ativo="minhas-vaquinhas">{conteudo}</Screen>;
}
