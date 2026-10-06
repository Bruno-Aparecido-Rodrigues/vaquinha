import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import Screen, { Container } from '@/components/screen';
import CampanhaCard from '@/components/campanha-card';
import TextField from '@/components/text-field';
import Icon from '@/components/icon';
import { EmptyView, ErrorView, LoadingView } from '@/components/state-views';
import { Campanha } from '@/@types/campanha';
import { listarCampanhas } from '@/integration/campanhaIntegration';
import { mensagemErro } from '@/utils/errors';
import { Colors } from '@/constants/colors';
import { Fonts, Radius, Shadow, Spacing, Type } from '@/constants/theme';

const POR_PAGINA = 9;
const COLUNAS = 3;

export default function Explorar() {
    const [campanhas, setCampanhas] = useState<Campanha[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState<string | null>(null);
    const [busca, setBusca] = useState('');
    const [pagina, setPagina] = useState(1);

    const carregar = useCallback(async () => {
        setErro(null);
        try {
            const lista = await listarCampanhas();
            // Explorar mostra só as vaquinhas que não foram encerradas
            setCampanhas(lista.filter(c => c.status !== 'ENCERRADA'));
        } catch (e) {
            setErro(mensagemErro(e, 'Não foi possível carregar as vaquinhas.'));
        } finally {
            setCarregando(false);
        }
    }, []);

    // Recarrega toda vez que a tela volta a ficar visível (ex.: depois de doar)
    useFocusEffect(useCallback(() => { carregar(); }, [carregar]));

    const filtradas = useMemo(() => {
        const termo = busca.trim().toLowerCase();
        if (!termo) return campanhas;
        return campanhas.filter(c =>
            c.titulo.toLowerCase().includes(termo) || c.criadorNome.toLowerCase().includes(termo));
    }, [campanhas, busca]);

    const totalPaginas = Math.max(1, Math.ceil(filtradas.length / POR_PAGINA));
    const paginaAtual = Math.min(pagina, totalPaginas);
    const inicio = (paginaAtual - 1) * POR_PAGINA;
    const visiveis = filtradas.slice(inicio, inicio + POR_PAGINA);

    return (
        <Screen ativo="explorar">
            {/* Título */}
            <Container style={styles.hero}>
                <Text style={[Type.display, styles.heroTitulo]}>
                    Apoie causas e transforme vidas
                </Text>
                <Text style={styles.heroSub}>Descubra vaquinhas e faça sua contribuição com rapidez e segurança.</Text>
            </Container>

            <Container>
                {/* Busca */}
                <View style={styles.buscaIlha}>
                    <TextField
                        icone="search"
                        value={busca}
                        onChangeText={t => { setBusca(t); setPagina(1); }}
                        placeholder="Buscar causas, pessoas ou vaquinhas..."
                        containerStyle={styles.busca}
                    />
                </View>

                {carregando ? (
                    <LoadingView texto="Carregando vaquinhas..." />
                ) : erro ? (
                    <ErrorView mensagem={erro} onRetry={() => { setCarregando(true); carregar(); }} />
                ) : visiveis.length === 0 ? (
                    <EmptyView
                        icone="search"
                        titulo={busca ? 'Nenhuma vaquinha encontrada' : 'Ainda não há vaquinhas abertas'}
                        descricao={busca ? `Nada corresponde a "${busca}". Tente outro termo.` : 'Que tal criar a primeira em "Minhas Vaquinhas"?'}
                    />
                ) : (
                    <>
                        {/* Grade de 3 colunas */}
                        <View style={styles.grade}>
                            {visiveis.map(c => (
                                <View key={c.id} style={[styles.celula, { width: `${100 / COLUNAS}%` as const }]}>
                                    <CampanhaCard campanha={c} />
                                </View>
                            ))}
                        </View>

                        <View style={styles.paginacao}>
                            <Text style={styles.contagem}>
                                Mostrando <Text style={styles.negrito}>{inicio + 1} - {inicio + visiveis.length}</Text> de{' '}
                                {filtradas.length} {filtradas.length === 1 ? 'campanha ativa' : 'campanhas ativas'}
                            </Text>
                            {totalPaginas > 1 ? (
                                <View style={styles.paginas}>
                                    <PaginaBotao icone="chevron-left" disabled={paginaAtual === 1} onPress={() => setPagina(paginaAtual - 1)} />
                                    {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(n => (
                                        <PaginaBotao key={n} numero={n} ativo={n === paginaAtual} onPress={() => setPagina(n)} />
                                    ))}
                                    <PaginaBotao icone="chevron-right" disabled={paginaAtual === totalPaginas} onPress={() => setPagina(paginaAtual + 1)} />
                                </View>
                            ) : null}
                        </View>
                    </>
                )}
            </Container>
        </Screen>
    );
}

function PaginaBotao({ numero, icone, ativo, disabled, onPress }: {
    numero?: number;
    icone?: 'chevron-left' | 'chevron-right';
    ativo?: boolean;
    disabled?: boolean;
    onPress: () => void;
}) {
    return (
        <Pressable
            onPress={onPress}
            disabled={disabled}
            style={[styles.paginaBtn, ativo && styles.paginaBtnAtivo, disabled && { opacity: 0.4 }]}
        >
            {icone ? (
                <Icon name={icone} size={20} color={Colors.onSurfaceVariant} />
            ) : (
                <Text style={[styles.paginaTexto, ativo && { color: Colors.onPrimary }]}>{numero}</Text>
            )}
        </Pressable>
    );
}

const styles = StyleSheet.create({
    hero: { paddingTop: Spacing.xl, paddingBottom: Spacing.lg, alignItems: 'center', gap: Spacing.sm },
    heroTitulo: { color: Colors.onSurface, textAlign: 'center' },
    heroSub: { ...Type.bodyLg, color: Colors.onSurfaceVariant, textAlign: 'center', maxWidth: 576 },
    buscaIlha: {
        backgroundColor: Colors.surfaceContainerLowest,
        borderRadius: Radius.xxl,
        padding: Spacing.md,
        marginBottom: Spacing.lg,
        ...Shadow.md,
    },
    busca: { width: '100%', maxWidth: 672, alignSelf: 'center' },
    grade: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -12 },
    celula: { padding: 12 },
    paginacao: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: Spacing.md,
        paddingTop: Spacing.md,
        paddingBottom: Spacing.xl,
    },
    contagem: { ...Type.labelSm, fontFamily: Fonts.medium, color: Colors.onSurfaceVariant },
    negrito: { fontFamily: Fonts.bold, color: Colors.onSurface },
    paginas: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap', justifyContent: 'center' },
    paginaBtn: {
        width: 40,
        height: 40,
        borderRadius: Radius.xl,
        backgroundColor: Colors.surfaceContainerLow,
        alignItems: 'center',
        justifyContent: 'center',
    },
    paginaBtnAtivo: { backgroundColor: Colors.primary, ...Shadow.sm },
    paginaTexto: { ...Type.labelMd, fontFamily: Fonts.bold, color: Colors.onSurfaceVariant },
});
