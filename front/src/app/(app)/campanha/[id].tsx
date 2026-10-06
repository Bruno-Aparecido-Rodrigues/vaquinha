import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import Screen, { Container } from '@/components/screen';
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
import {
    codigoCampanha, diasRestantes, formatarDataLonga, formatarMoeda, formatarMoedaCurta, percentual, podeDoar,
    tempoRelativo, valorRestante,
} from '@/utils/format';
import { mensagemErro } from '@/utils/errors';
import { Colors } from '@/constants/colors';
import { Fonts, Radius, Shadow, Spacing, Type } from '@/constants/theme';

/** Página da vaquinha (abre ao apertar "Apoiar"): descrição, doações e o botão que abre o modal. */
export default function DetalheCampanha() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { showToast } = useToast();

    const [campanha, setCampanha] = useState<Campanha | null>(null);
    const [doacoes, setDoacoes] = useState<Doacao[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState<string | null>(null);
    const [modalAberto, setModalAberto] = useState(false);

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
            <Text style={[Type.display, { color: Colors.onSurface }]}>{campanha.titulo}</Text>
            <Text style={styles.organizador}>
                Organizado por <Text style={styles.organizadorNome}>{campanha.criadorNome}</Text>
            </Text>
        </View>
    );

    const resumo = (
        <View style={styles.resumo}>
            <View style={styles.resumoValores}>
                <View style={styles.arrecadadoRow}>
                    <Text style={[Type.display, styles.arrecadado]}>
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
        <View style={styles.cartao}>
            <View style={styles.cartaoTitulo}>
                <Icon name="description" size={28} color={Colors.primary} />
                <Text style={styles.h2}>Detalhes da vaquinha</Text>
            </View>
            {campanha.descricao.split(/\n+/).filter(p => p.trim()).map((paragrafo, i) => (
                <Text key={i} style={i === 0 ? styles.paragrafoPrincipal : styles.paragrafo}>{paragrafo}</Text>
            ))}
        </View>
    );

    const listaDoacoes = (
        <View style={styles.cartao}>
            <View style={styles.doacoesTopo}>
                <View style={{ flexShrink: 1 }}>
                    <View style={styles.cartaoTitulo}>
                        <Icon name="volunteer-activism" size={28} color={Colors.primary} />
                        <Text style={styles.h2}>Doações</Text>
                    </View>
                    <Text style={styles.doacoesSub}>
                        {doacoes.length === 0
                            ? 'Ninguém doou ainda. Seja a primeira pessoa a apoiar!'
                            : `${doacoes.length} ${doacoes.length === 1 ? 'pessoa unida' : 'pessoas unidas'} por esta causa`}
                    </Text>
                </View>
            </View>

            <View style={{ gap: Spacing.sm }}>
                {doacoes.map(d => (
                    <View key={d.id} style={styles.doacao}>
                        <View style={{ flexShrink: 1, gap: 2 }}>
                            <Text style={styles.doador} numberOfLines={1}>{d.doadorNome}</Text>
                            <Text style={styles.quando}>Doou {tempoRelativo(d.data)}</Text>
                        </View>
                        <Text style={styles.valorDoacao}>{formatarMoeda(d.valor)}</Text>
                    </View>
                ))}
            </View>
        </View>
    );

    return (
        <Screen>
            <Container style={styles.pagina}>
                <View style={styles.colunas}>
                    <View style={styles.colunaEsquerda}>
                        {cabecalho}
                        {detalhes}
                        {listaDoacoes}
                    </View>
                    <View style={styles.colunaDireita}>{resumo}</View>
                </View>
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

const styles = StyleSheet.create({
    pagina: { paddingTop: Spacing.lg, paddingBottom: Spacing.xl },
    colunas: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.xl },
    colunaEsquerda: { flex: 2, gap: Spacing.xl, minWidth: 0 },
    colunaDireita: { flex: 1, minWidth: 360 },
    cabecalho: { gap: Spacing.xs },
    metaLinha: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: Spacing.sm },
    metaTexto: { ...Type.labelSm, color: Colors.onSurfaceVariant },
    metaPrazo: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    organizador: { ...Type.bodySm, color: Colors.onSurfaceVariant, marginTop: Spacing.xs },
    organizadorNome: { ...Type.labelLg, fontFamily: Fonts.bold, color: Colors.onSurface },
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
    cartaoTitulo: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
    h2: { ...Type.headlineMd, color: Colors.onSurface },
    paragrafoPrincipal: { ...Type.bodyLg, color: Colors.onSurface },
    paragrafo: { ...Type.bodyMd, color: Colors.onSurfaceVariant },
    doacoesTopo: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: Spacing.sm },
    doacoesSub: { ...Type.bodySm, color: Colors.onSurfaceVariant, marginTop: 2 },
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
