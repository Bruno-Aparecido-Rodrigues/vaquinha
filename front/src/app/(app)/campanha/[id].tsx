import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import Screen, { Container } from '@/components/screen';
import CampanhaImage from '@/components/campanha-image';
import ProgressBar from '@/components/progress-bar';
import Button from '@/components/button';
import Icon from '@/components/icon';
import DoacaoModal from '@/components/doacao-modal';
import { ErrorView, LoadingView } from '@/components/state-views';
import { Campanha } from '@/@types/campanha';
import { Doacao, DoacaoResponse } from '@/@types/doacao';
import { buscarCampanha } from '@/integration/campanhaIntegration';
import { listarDoacoesDaCampanha } from '@/integration/doacaoIntegration';
import { useToast } from '@/context/ToastContext';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import {
    codigoCampanha, diasRestantes, formatarDataLonga, formatarMoeda, formatarMoedaCurta, percentual, podeDoar,
    tempoRelativo, valorRestante,
} from '@/utils/format';
import { mensagemErro } from '@/utils/errors';
import { Colors } from '@/constants/colors';
import { Fonts, Radius, Shadow, Spacing, Type } from '@/constants/theme';

const DOACOES_INICIAIS = 4;
type Ordem = 'recentes' | 'maiores';

/** Página da vaquinha (abre ao apertar "Apoiar"): foto, descrição, doações e o botão que abre o modal. */
export default function DetalheCampanha() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { isLg, isMd } = useBreakpoint();
    const { showToast } = useToast();

    const [campanha, setCampanha] = useState<Campanha | null>(null);
    const [doacoes, setDoacoes] = useState<Doacao[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState<string | null>(null);
    const [modalAberto, setModalAberto] = useState(false);
    const [ordem, setOrdem] = useState<Ordem>('recentes');
    const [verTodas, setVerTodas] = useState(false);

    const carregar = useCallback(async () => {
        if (!id) return;
        setErro(null);
        try {
            const [c, d] = await Promise.all([buscarCampanha(id), listarDoacoesDaCampanha(id)]);
            setCampanha(c);
            setDoacoes(d);
        } catch (e) {
            setErro(mensagemErro(e, 'Não foi possível carregar esta vaquinha.'));
        } finally {
            setCarregando(false);
        }
    }, [id]);

    useFocusEffect(useCallback(() => { carregar(); }, [carregar]));

    const ordenadas = useMemo(() => {
        const copia = [...doacoes];
        if (ordem === 'maiores') copia.sort((a, b) => b.valor - a.valor);
        else copia.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
        return copia;
    }, [doacoes, ordem]);

    function doacaoConcluida(resposta: DoacaoResponse) {
        setModalAberto(false);
        showToast({
            titulo: 'Doação confirmada!',
            descricao: `Você doou ${formatarMoeda(resposta.doacao.valor)}. Obrigado por apoiar!`,
            icone: 'favorite',
        });
        carregar();
    }

    if (carregando) {
        return <Screen><LoadingView texto="Carregando vaquinha..." /></Screen>;
    }
    if (erro || !campanha) {
        return <Screen><ErrorView mensagem={erro ?? 'Vaquinha não encontrada.'} onRetry={() => { setCarregando(true); carregar(); }} /></Screen>;
    }

    const pct = percentual(campanha.valorArrecadado, campanha.meta);
    const restante = valorRestante(campanha);
    const dias = diasRestantes(campanha.dataLimite);
    const aceitaDoacao = podeDoar(campanha);
    const listaVisivel = verTodas ? ordenadas : ordenadas.slice(0, DOACOES_INICIAIS);

    let textoPrazo = `Encerra em ${dias} dias`;
    if (campanha.status === 'ENCERRADA') textoPrazo = 'Arrecadação encerrada';
    else if (dias < 0) textoPrazo = 'Prazo encerrado';
    else if (dias === 0) textoPrazo = 'Encerra hoje';
    else if (dias === 1) textoPrazo = 'Encerra amanhã';

    let textoBotao = 'Doar para esta vaquinha';
    if (!aceitaDoacao) {
        textoBotao = campanha.status === 'META_ATINGIDA' || restante <= 0 ? 'Meta atingida' : 'Doações encerradas';
    }

    // ---------- blocos ----------
    const cabecalho = (
        <View style={styles.cabecalho}>
            <View style={styles.metaLinha}>
                <Text style={styles.metaTexto}>Criada em {formatarDataLonga(campanha.dataCriacao)}</Text>
                <Text style={styles.metaTexto}>•</Text>
                <View style={styles.metaPrazo}>
                    <Icon name="schedule" size={16} color={Colors.primary} />
                    <Text style={[styles.metaTexto, { color: Colors.primary }]}>{textoPrazo}</Text>
                </View>
                <Text style={styles.metaTexto}>•</Text>
                <Text style={styles.metaTexto}>Cód. {codigoCampanha(campanha.id)}</Text>
            </View>
            <Text style={[isMd ? Type.display : Type.displayMobile, { color: Colors.onSurface }]}>{campanha.titulo}</Text>
            <Text style={styles.organizador}>
                Organizado por <Text style={styles.organizadorNome}>{campanha.criadorNome}</Text>
            </Text>
        </View>
    );

    const foto = (
        <View style={[styles.foto, { height: isMd ? 380 : 240 }]}>
            <CampanhaImage uri={campanha.imagemUrl} />
        </View>
    );

    const resumo = (
        <View style={styles.resumo}>
            <View style={styles.resumoValores}>
                <View style={styles.arrecadadoRow}>
                    <Text style={[isMd ? Type.display : Type.displayMobile, styles.arrecadado]}>
                        {formatarMoedaCurta(campanha.valorArrecadado)}
                    </Text>
                    <Text style={styles.arrecadadoLabel}>arrecadados</Text>
                </View>
                <View style={styles.linhaEntre}>
                    <Text style={styles.metaLabel}>Meta: <Text style={styles.metaValor}>{formatarMoedaCurta(campanha.meta)}</Text></Text>
                    <Text style={styles.concluido}>{pct}% concluído</Text>
                </View>
                <ProgressBar percentual={pct} altura={12} inset />
                <View style={[styles.linhaEntre, { paddingTop: 4 }]}>
                    <View style={styles.iconeTexto}>
                        <Icon name="flag" size={16} color={Colors.secondary} />
                        <Text style={styles.faltam}>
                            {restante > 0 ? `Faltam apenas ${formatarMoedaCurta(restante)}` : 'Meta atingida!'}
                        </Text>
                    </View>
                    <View style={styles.iconeTexto}>
                        <Icon name="group" size={16} color={Colors.onSurfaceVariant} />
                        <Text style={styles.apoiadores}>
                            {campanha.totalDoacoes} {campanha.totalDoacoes === 1 ? 'apoiador' : 'apoiadores'}
                        </Text>
                    </View>
                </View>
            </View>
            <Button
                tamanho="lg"
                icone="volunteer-activism"
                title={textoBotao}
                onPress={() => setModalAberto(true)}
                disabled={!aceitaDoacao}
            />
        </View>
    );

    const detalhes = (
        <View style={[styles.cartao, !isMd && styles.cartaoMobile]}>
            <View style={styles.cartaoTitulo}>
                <Icon name="description" size={isMd ? 28 : 24} color={Colors.primary} />
                <Text style={[styles.h2, !isMd && styles.h2Mobile]}>Detalhes da vaquinha</Text>
            </View>
            {campanha.descricao.split(/\n+/).filter(p => p.trim()).map((paragrafo, i) => (
                <Text key={i} style={i === 0 ? styles.paragrafoPrincipal : styles.paragrafo}>{paragrafo}</Text>
            ))}
        </View>
    );

    const listaDoacoes = (
        <View style={[styles.cartao, !isMd && styles.cartaoMobile]}>
            <View style={styles.doacoesTopo}>
                <View style={{ flexShrink: 1 }}>
                    <View style={styles.cartaoTitulo}>
                        <Icon name="volunteer-activism" size={isMd ? 28 : 24} color={Colors.primary} />
                        <Text style={[styles.h2, !isMd && styles.h2Mobile]}>Doações Recentes</Text>
                    </View>
                    <Text style={styles.doacoesSub}>
                        {doacoes.length === 0
                            ? 'Ninguém doou ainda. Seja a primeira pessoa a apoiar!'
                            : `${doacoes.length} ${doacoes.length === 1 ? 'pessoa unida' : 'pessoas unidas'} por esta causa`}
                    </Text>
                </View>
                {doacoes.length > 1 ? (
                    <View style={styles.ordem}>
                        <OrdemChip texto="Mais recentes" ativo={ordem === 'recentes'} onPress={() => setOrdem('recentes')} />
                        <OrdemChip texto="Maiores valores" ativo={ordem === 'maiores'} onPress={() => setOrdem('maiores')} />
                    </View>
                ) : null}
            </View>

            <View style={{ gap: Spacing.sm }}>
                {listaVisivel.map(d => (
                    <View key={d.id} style={styles.doacao}>
                        <View style={{ flexShrink: 1, gap: 2 }}>
                            <Text style={styles.doador} numberOfLines={1}>{d.doadorNome}</Text>
                            <Text style={styles.quando}>Doou {tempoRelativo(d.data)}</Text>
                        </View>
                        <Text style={styles.valorDoacao}>{formatarMoeda(d.valor)}</Text>
                    </View>
                ))}
            </View>

            {doacoes.length > DOACOES_INICIAIS ? (
                <Button
                    variante="tonal"
                    title={verTodas ? 'Mostrar menos' : `Ver todos os ${doacoes.length} apoios`}
                    iconeDireita={verTodas ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                    onPress={() => setVerTodas(v => !v)}
                    style={{ alignSelf: 'center' }}
                />
            ) : null}
        </View>
    );

    return (
        <Screen>
            <Container style={styles.pagina}>
                {isLg ? (
                    <View style={styles.colunas}>
                        <View style={styles.colunaEsquerda}>
                            {cabecalho}
                            {foto}
                            {detalhes}
                            {listaDoacoes}
                        </View>
                        <View style={styles.colunaDireita}>{resumo}</View>
                    </View>
                ) : (
                    <View style={styles.pilha}>
                        {cabecalho}
                        {foto}
                        {resumo}
                        {detalhes}
                        {listaDoacoes}
                    </View>
                )}
            </Container>

            <DoacaoModal
                visible={modalAberto}
                campanha={campanha}
                onClose={() => setModalAberto(false)}
                onConcluida={doacaoConcluida}
                onRecusada={carregar}
            />
        </Screen>
    );
}

function OrdemChip({ texto, ativo, onPress }: { texto: string; ativo: boolean; onPress: () => void }) {
    return (
        <Pressable onPress={onPress} style={[styles.chip, ativo && styles.chipAtivo]}>
            <Text style={[styles.chipTexto, ativo && { color: Colors.onSurface }]}>{texto}</Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    pagina: { paddingTop: Spacing.lg, paddingBottom: Spacing.xl },
    colunas: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.xl },
    colunaEsquerda: { flex: 2, gap: Spacing.xl, minWidth: 0 },
    colunaDireita: { flex: 1, minWidth: 360 },
    pilha: { gap: Spacing.lg },
    cabecalho: { gap: Spacing.xs },
    metaLinha: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: Spacing.sm },
    metaTexto: { ...Type.labelSm, color: Colors.onSurfaceVariant },
    metaPrazo: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    organizador: { ...Type.bodySm, color: Colors.onSurfaceVariant, marginTop: Spacing.xs },
    organizadorNome: { ...Type.labelLg, fontFamily: Fonts.bold, color: Colors.onSurface },
    foto: { borderRadius: Radius.xl, overflow: 'hidden', backgroundColor: Colors.surfaceContainer, ...Shadow.sm },
    resumo: {
        backgroundColor: Colors.surfaceContainerLowest,
        padding: Spacing.lg,
        borderRadius: Radius.xl,
        gap: Spacing.lg,
        ...Shadow.md,
    },
    resumoValores: { gap: Spacing.xs },
    arrecadadoRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' },
    arrecadado: { color: Colors.primary, fontFamily: Fonts.extrabold },
    arrecadadoLabel: { ...Type.bodyMd, color: Colors.onSurfaceVariant },
    linhaEntre: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
    metaLabel: { ...Type.labelMd, color: Colors.onSurfaceVariant },
    metaValor: { fontFamily: Fonts.bold, color: Colors.onSurface },
    concluido: { ...Type.labelMd, fontFamily: Fonts.bold, color: Colors.primary },
    iconeTexto: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    faltam: { ...Type.labelSm, color: Colors.secondary },
    apoiadores: { ...Type.labelSm, fontFamily: Fonts.medium, color: Colors.onSurfaceVariant },
    cartao: {
        backgroundColor: Colors.surfaceContainerLowest,
        padding: Spacing.xl,
        borderRadius: Radius.xl,
        gap: Spacing.md,
        ...Shadow.sm,
    },
    cartaoMobile: { padding: Spacing.md },
    cartaoTitulo: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
    h2: { ...Type.headlineMd, color: Colors.onSurface },
    h2Mobile: { ...Type.headlineSm, fontFamily: Fonts.bold },
    paragrafoPrincipal: { ...Type.bodyLg, color: Colors.onSurface },
    paragrafo: { ...Type.bodyMd, color: Colors.onSurfaceVariant },
    doacoesTopo: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: Spacing.sm },
    doacoesSub: { ...Type.bodySm, color: Colors.onSurfaceVariant, marginTop: 2 },
    ordem: { flexDirection: 'row', gap: 8 },
    chip: { paddingHorizontal: Spacing.md, paddingVertical: 4, borderRadius: Radius.full },
    chipAtivo: { backgroundColor: Colors.surfaceContainer },
    chipTexto: { ...Type.labelSm, color: Colors.outline },
    doacao: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: Spacing.md,
        padding: Spacing.md,
        borderRadius: Radius.xl,
        backgroundColor: Colors.surfaceContainerLow,
    },
    doador: { ...Type.labelLg, color: Colors.onSurface },
    quando: { ...Type.bodySm, color: Colors.onSurfaceVariant },
    valorDoacao: { ...Type.headlineSm, fontFamily: Fonts.bold, color: Colors.primary },
});
