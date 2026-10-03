import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Screen, { Container } from '@/components/screen';
import Button from '@/components/button';
import Icon, { IconName } from '@/components/icon';
import { EmptyView, ErrorView, LoadingView } from '@/components/state-views';
import { Operacao, StatusOperacao } from '@/@types/relatorio';
import { listarOperacoes } from '@/integration/relatorioIntegration';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { formatarHora, formatarMoeda } from '@/utils/format';
import { mensagemErro } from '@/utils/errors';
import { Colors } from '@/constants/colors';
import { Fonts, Radius, Shadow, Spacing, Type } from '@/constants/theme';

const INTERVALO_MS = 3000;

type Aba = 'doacoes' | 'eventos';
type FiltroStatus = 'TODAS' | StatusOperacao;

const STATUS: Record<StatusOperacao, { label: string; icone: IconName; fundo: string; cor: string }> = {
    PENDENTE: { label: 'Pendente', icone: 'schedule', fundo: Colors.surfaceContainerHigh, cor: Colors.onSurfaceVariant },
    PROCESSANDO: { label: 'Processando', icone: 'sync', fundo: Colors.secondaryFixed, cor: Colors.onSecondaryFixed },
    CONFLITO: { label: 'Conflito', icone: 'bolt', fundo: Colors.warningContainer, cor: Colors.onWarningContainer },
    CONCLUIDA: { label: 'Concluída', icone: 'check-circle', fundo: Colors.primaryFixed, cor: Colors.onPrimaryFixed },
    RECUSADA: { label: 'Recusada', icone: 'block', fundo: Colors.errorContainer, cor: Colors.onErrorContainer },
    ERRO: { label: 'Erro', icone: 'error', fundo: Colors.error, cor: Colors.onError },
};

const FILTROS: FiltroStatus[] = ['TODAS', 'PENDENTE', 'PROCESSANDO', 'CONFLITO', 'CONCLUIDA', 'RECUSADA', 'ERRO'];

const EVENTOS: Record<string, string> = {
    CAMPANHA_CRIADA: 'Campanha criada',
    CAMPANHA_ATUALIZADA: 'Campanha atualizada',
    CAMPANHA_ENCERRADA: 'Campanha encerrada',
    CAMPANHA_EXCLUIDA: 'Campanha excluída',
};

/**
 * Tela exclusiva do ADMIN: mostra cada operação de doação passando pelos estados
 * PENDENTE -> PROCESSANDO -> (CONFLITO) -> CONCLUIDA / RECUSADA, e os eventos do CRUD
 * que chegaram ao serviço de Relatório pelo RabbitMQ.
 */
export default function PainelAdmin() {
    const { isMd, isLg } = useBreakpoint();
    const [operacoes, setOperacoes] = useState<Operacao[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState<string | null>(null);
    const [aoVivo, setAoVivo] = useState(true);
    const [atualizadoEm, setAtualizadoEm] = useState<Date | null>(null);
    const [aba, setAba] = useState<Aba>('doacoes');
    const [filtro, setFiltro] = useState<FiltroStatus>('TODAS');
    const buscando = useRef(false);

    const carregar = useCallback(async () => {
        if (buscando.current) return;
        buscando.current = true;
        try {
            const lista = await listarOperacoes();
            lista.sort((a, b) => new Date(b.inicio).getTime() - new Date(a.inicio).getTime());
            setOperacoes(lista);
            setErro(null);
            setAtualizadoEm(new Date());
        } catch (e) {
            setErro(mensagemErro(e, 'Não foi possível carregar o relatório.'));
        } finally {
            buscando.current = false;
            setCarregando(false);
        }
    }, []);

    useEffect(() => { carregar(); }, [carregar]);

    // Atualização automática ("ao vivo") a cada 3 segundos
    useEffect(() => {
        if (!aoVivo) return;
        const timer = setInterval(carregar, INTERVALO_MS);
        return () => clearInterval(timer);
    }, [aoVivo, carregar]);

    const doacoes = useMemo(() => operacoes.filter(o => o.tipo === 'DOACAO'), [operacoes]);
    const eventos = useMemo(() => operacoes.filter(o => o.tipo !== 'DOACAO'), [operacoes]);

    const resumo = useMemo(() => {
        const conta = (s: StatusOperacao) => doacoes.filter(o => o.status === s).length;
        return {
            total: doacoes.length,
            concluidas: conta('CONCLUIDA'),
            andamento: conta('PENDENTE') + conta('PROCESSANDO') + conta('CONFLITO'),
            conflitos: doacoes.filter(o => (o.tentativas ?? 1) > 1 || o.status === 'CONFLITO').length,
            recusadas: conta('RECUSADA') + conta('ERRO'),
            arrecadado: doacoes.filter(o => o.status === 'CONCLUIDA').reduce((s, o) => s + (o.valor ?? 0), 0),
        };
    }, [doacoes]);

    const lista = (aba === 'doacoes' ? doacoes : eventos)
        .filter(o => filtro === 'TODAS' || o.status === filtro);

    const colunasCards = isLg ? 5 : isMd ? 3 : 2;

    return (
        <Screen admin>
            <Container style={styles.pagina}>
                {/* Cabeçalho */}
                <View style={[styles.topo, isMd && styles.topoMd]}>
                    <View style={{ flexShrink: 1 }}>
                        <View style={styles.sobretitulo}>
                            <Icon name="analytics" size={18} color={Colors.secondary} />
                            <Text style={styles.sobretituloTexto}>RELATÓRIO</Text>
                        </View>
                        <Text style={styles.h1}>Monitor de Operações</Text>
                        <Text style={styles.subtitulo}>
                            Acompanhe em tempo real as transações de doação, a disputa por concorrência e os eventos recebidos pelo RabbitMQ.
                        </Text>
                    </View>
                    <View style={styles.controles}>
                        <Pressable onPress={() => setAoVivo(v => !v)} style={[styles.aoVivo, !aoVivo && styles.pausado]}>
                            <View style={[styles.pontoVivo, !aoVivo && { backgroundColor: Colors.outline }]} />
                            <Text style={[styles.aoVivoTexto, !aoVivo && { color: Colors.onSurfaceVariant }]}>
                                {aoVivo ? 'Ao vivo' : 'Pausado'}
                            </Text>
                            <Icon name={aoVivo ? 'pause' : 'play-arrow'} size={16} color={aoVivo ? Colors.onPrimaryFixed : Colors.onSurfaceVariant} />
                        </Pressable>
                        <Button title="Atualizar" icone="refresh" variante="tonal" tamanho="sm" onPress={carregar} />
                    </View>
                </View>
                {atualizadoEm ? (
                    <Text style={styles.atualizado}>Atualizado às {formatarHora(atualizadoEm.toISOString())}</Text>
                ) : null}

                {/* Cartões de resumo */}
                <View style={styles.cards}>
                    {[
                        { label: 'Doações processadas', valor: String(resumo.total), icone: 'receipt-long' as IconName, cor: Colors.onSurface },
                        { label: 'Concluídas', valor: String(resumo.concluidas), icone: 'check-circle' as IconName, cor: Colors.primary },
                        { label: 'Em andamento', valor: String(resumo.andamento), icone: 'sync' as IconName, cor: Colors.secondary },
                        { label: 'Com conflito', valor: String(resumo.conflitos), icone: 'bolt' as IconName, cor: Colors.onWarningContainer },
                        { label: 'Recusadas / erro', valor: String(resumo.recusadas), icone: 'block' as IconName, cor: Colors.error },
                    ].map(card => (
                        <View key={card.label} style={[styles.cardCelula, { width: `${100 / colunasCards}%` as const }]}>
                            <View style={styles.card}>
                                <View style={styles.cardTopo}>
                                    <Text style={styles.cardLabel}>{card.label}</Text>
                                    <Icon name={card.icone} size={18} color={card.cor} />
                                </View>
                                <Text style={[styles.cardValor, { color: card.cor }]}>{card.valor}</Text>
                            </View>
                        </View>
                    ))}
                </View>
                <View style={styles.totalArrecadado}>
                    <Icon name="savings" size={20} color={Colors.primary} />
                    <Text style={styles.totalTexto}>
                        Total confirmado nas transações: <Text style={styles.totalValor}>{formatarMoeda(resumo.arrecadado)}</Text>
                    </Text>
                </View>

                {/* Abas */}
                <View style={[styles.abas, !isMd && styles.abasMobile]}>
                    <AbaBotao texto={`Doações (${doacoes.length})`} icone="volunteer-activism" ativa={aba === 'doacoes'}
                              onPress={() => { setAba('doacoes'); setFiltro('TODAS'); }} />
                    <AbaBotao texto={`${isMd ? 'Eventos do CRUD' : 'Eventos'} (${eventos.length})`} icone="campaign" ativa={aba === 'eventos'}
                              onPress={() => { setAba('eventos'); setFiltro('TODAS'); }} />
                </View>

                {/* Filtro por status */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtros}>
                    {FILTROS.map(f => (
                        <Pressable key={f} onPress={() => setFiltro(f)} style={[styles.filtro, filtro === f && styles.filtroAtivo]}>
                            <Text style={[styles.filtroTexto, filtro === f && { color: Colors.onSurface }]}>
                                {f === 'TODAS' ? 'Todas' : STATUS[f].label}
                            </Text>
                        </Pressable>
                    ))}
                </ScrollView>

                {/* Lista */}
                {carregando ? (
                    <LoadingView texto="Carregando operações..." />
                ) : erro && operacoes.length === 0 ? (
                    <ErrorView mensagem={erro} onRetry={carregar} />
                ) : lista.length === 0 ? (
                    <EmptyView
                        icone="inbox"
                        titulo="Nenhuma operação por aqui"
                        descricao={aba === 'doacoes'
                            ? 'Quando alguém doar (ou o k6 disparar várias doações), as operações aparecem aqui em tempo real.'
                            : 'Os eventos de criar, atualizar e excluir aparecem aqui assim que chegam pelo RabbitMQ.'}
                    />
                ) : aba === 'doacoes' ? (
                    isLg ? <TabelaDoacoes operacoes={lista} /> : <CardsDoacoes operacoes={lista} />
                ) : (
                    <ListaEventos operacoes={lista} />
                )}
            </Container>
        </Screen>
    );
}

function AbaBotao({ texto, icone, ativa, onPress }: { texto: string; icone: IconName; ativa: boolean; onPress: () => void }) {
    return (
        <Pressable onPress={onPress} style={[styles.aba, ativa && styles.abaAtiva]}>
            <Icon name={icone} size={18} color={ativa ? Colors.primary : Colors.onSurfaceVariant} />
            <Text style={[styles.abaTexto, ativa && { color: Colors.primary }]} numberOfLines={1}>{texto}</Text>
        </Pressable>
    );
}

function StatusBadge({ status }: { status: StatusOperacao }) {
    const s = STATUS[status] ?? STATUS.PENDENTE;
    return (
        <View style={[styles.badge, { backgroundColor: s.fundo }]}>
            <Icon name={s.icone} size={14} color={s.cor} />
            <Text style={[styles.badgeTexto, { color: s.cor }]}>{s.label}</Text>
        </View>
    );
}

function duracao(o: Operacao): string {
    if (!o.fim) return '—';
    const ms = new Date(o.fim).getTime() - new Date(o.inicio).getTime();
    return ms < 1000 ? `${ms} ms` : `${(ms / 1000).toFixed(1)} s`;
}

const COLUNAS = [
    { titulo: 'Status', flex: 1.2 },
    { titulo: 'Campanha', flex: 2 },
    { titulo: 'Doador', flex: 1.4 },
    { titulo: 'Valor', flex: 1 },
    { titulo: 'Tentativas', flex: 0.8 },
    { titulo: 'Início', flex: 0.9 },
    { titulo: 'Duração', flex: 0.8 },
    { titulo: 'Motivo', flex: 2 },
];

function TabelaDoacoes({ operacoes }: { operacoes: Operacao[] }) {
    return (
        <View style={styles.tabela}>
            <View style={[styles.tr, styles.thead]}>
                {COLUNAS.map(c => <Text key={c.titulo} style={[styles.th, { flex: c.flex }]}>{c.titulo}</Text>)}
            </View>
            {operacoes.map((o, i) => (
                <View key={o.operacaoId} style={[styles.tr, i % 2 === 1 && styles.trAlt]}>
                    <View style={{ flex: COLUNAS[0].flex }}><StatusBadge status={o.status} /></View>
                    <Text style={[styles.td, styles.tdForte, { flex: COLUNAS[1].flex }]} numberOfLines={1}>{o.campanhaTitulo ?? '—'}</Text>
                    <Text style={[styles.td, { flex: COLUNAS[2].flex }]} numberOfLines={1}>{o.usuarioNome ?? '—'}</Text>
                    <Text style={[styles.td, styles.tdForte, { flex: COLUNAS[3].flex }]}>{o.valor != null ? formatarMoeda(o.valor) : '—'}</Text>
                    <Text style={[styles.td, { flex: COLUNAS[4].flex }, (o.tentativas ?? 1) > 1 && styles.tdAlerta]}>
                        {o.tentativas ?? 1}
                    </Text>
                    <Text style={[styles.td, { flex: COLUNAS[5].flex }]}>{formatarHora(o.inicio)}</Text>
                    <Text style={[styles.td, { flex: COLUNAS[6].flex }]}>{duracao(o)}</Text>
                    <Text style={[styles.td, styles.tdMotivo, { flex: COLUNAS[7].flex }]} numberOfLines={2}>{o.motivo ?? '—'}</Text>
                </View>
            ))}
        </View>
    );
}

function CardsDoacoes({ operacoes }: { operacoes: Operacao[] }) {
    return (
        <View style={{ gap: Spacing.sm }}>
            {operacoes.map(o => (
                <View key={o.operacaoId} style={styles.opCard}>
                    <View style={styles.opCardTopo}>
                        <StatusBadge status={o.status} />
                        <Text style={styles.opHora}>{formatarHora(o.inicio)} · {duracao(o)}</Text>
                    </View>
                    <Text style={styles.opTitulo} numberOfLines={1}>{o.campanhaTitulo ?? '—'}</Text>
                    <View style={styles.opLinha}>
                        <Text style={styles.opTexto}>{o.usuarioNome ?? '—'}</Text>
                        <Text style={styles.opValor}>{o.valor != null ? formatarMoeda(o.valor) : '—'}</Text>
                    </View>
                    <Text style={[styles.opTexto, (o.tentativas ?? 1) > 1 && styles.tdAlerta]}>
                        {o.tentativas ?? 1} {(o.tentativas ?? 1) === 1 ? 'tentativa' : 'tentativas'}
                        {o.motivo ? ` · ${o.motivo}` : ''}
                    </Text>
                </View>
            ))}
        </View>
    );
}

function ListaEventos({ operacoes }: { operacoes: Operacao[] }) {
    return (
        <View style={styles.tabela}>
            {operacoes.map((o, i) => (
                <View key={o.operacaoId} style={[styles.evento, i % 2 === 1 && styles.trAlt]}>
                    <View style={styles.eventoIcone}>
                        <Icon name="campaign" size={18} color={Colors.primary} />
                    </View>
                    <View style={{ flex: 1, minWidth: 0 }}>
                        <Text style={styles.eventoTitulo}>{EVENTOS[o.tipo] ?? o.tipo}</Text>
                        <Text style={styles.eventoDescricao} numberOfLines={1}>
                            {[o.campanhaTitulo, o.usuarioNome].filter(Boolean).join(' · ') || '—'}
                        </Text>
                    </View>
                    <StatusBadge status={o.status} />
                    <Text style={styles.eventoHora}>{formatarHora(o.inicio)}</Text>
                </View>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    pagina: { paddingVertical: Spacing.xl },
    topo: { gap: Spacing.md },
    topoMd: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
    sobretitulo: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, marginBottom: Spacing.xs },
    sobretituloTexto: { ...Type.labelSm, fontFamily: Fonts.semibold, letterSpacing: 1.2, color: Colors.secondary },
    h1: { ...Type.headlineLg, color: Colors.onSurface },
    subtitulo: { ...Type.bodySm, color: Colors.onSurfaceVariant, marginTop: 4, maxWidth: 640 },
    controles: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
    aoVivo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: Radius.full,
        backgroundColor: Colors.primaryFixed,
    },
    pausado: { backgroundColor: Colors.surfaceContainerHigh },
    pontoVivo: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary },
    aoVivoTexto: { ...Type.labelMd, color: Colors.onPrimaryFixed },
    atualizado: { ...Type.labelSm, fontFamily: Fonts.medium, color: Colors.outline, marginTop: Spacing.sm },
    cards: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -6, marginTop: Spacing.lg },
    cardCelula: { padding: 6 },
    card: {
        backgroundColor: Colors.surfaceContainerLowest,
        borderRadius: Radius.xxl,
        padding: Spacing.md,
        gap: Spacing.xs,
        ...Shadow.sm,
    },
    cardTopo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
    cardLabel: { ...Type.labelSm, fontFamily: Fonts.semibold, color: Colors.onSurfaceVariant, flexShrink: 1 },
    cardValor: { ...Type.financialStat },
    totalArrecadado: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: Spacing.md,
        padding: Spacing.md,
        borderRadius: Radius.xl,
        backgroundColor: Colors.surfaceContainerLow,
    },
    totalTexto: { ...Type.bodySm, color: Colors.onSurfaceVariant, flexShrink: 1 },
    totalValor: { fontFamily: Fonts.bold, color: Colors.primary },
    abas: {
        flexDirection: 'row',
        padding: 6,
        gap: 4,
        marginTop: Spacing.xl,
        borderRadius: Radius.xxl,
        backgroundColor: Colors.surfaceContainer,
        alignSelf: 'flex-start',
        maxWidth: '100%',
    },
    abasMobile: { alignSelf: 'stretch' },
    aba: { flexGrow: 1, justifyContent: 'center', flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: Radius.xl, flexShrink: 1 },
    abaAtiva: { backgroundColor: Colors.surfaceContainerLowest, ...Shadow.sm },
    abaTexto: { ...Type.labelMd, color: Colors.onSurfaceVariant, flexShrink: 1 },
    filtros: { gap: Spacing.sm, paddingVertical: Spacing.md },
    filtro: { paddingHorizontal: Spacing.md, paddingVertical: 6, borderRadius: Radius.full, backgroundColor: Colors.surfaceContainerLow },
    filtroAtivo: { backgroundColor: Colors.surfaceContainerHigh, ...Shadow.sm },
    filtroTexto: { ...Type.labelMd, color: Colors.onSurfaceVariant },
    tabela: {
        backgroundColor: Colors.surfaceContainerLowest,
        borderRadius: Radius.xxl,
        overflow: 'hidden',
        ...Shadow.sm,
    },
    tr: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingHorizontal: Spacing.md, paddingVertical: 12 },
    thead: { backgroundColor: Colors.surfaceContainerLow },
    trAlt: { backgroundColor: 'rgba(247, 243, 239, 0.5)' },
    th: { ...Type.labelSm, color: Colors.onSurfaceVariant, letterSpacing: 0.6 },
    td: { ...Type.bodySm, color: Colors.onSurfaceVariant },
    tdForte: { fontFamily: Fonts.semibold, color: Colors.onSurface },
    tdAlerta: { fontFamily: Fonts.bold, color: Colors.onWarningContainer },
    tdMotivo: { fontSize: 13 },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        gap: 4,
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: Radius.full,
    },
    badgeTexto: { ...Type.labelSm },
    opCard: {
        backgroundColor: Colors.surfaceContainerLowest,
        borderRadius: Radius.xxl,
        padding: Spacing.md,
        gap: 6,
        ...Shadow.sm,
    },
    opCardTopo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
    opHora: { ...Type.labelSm, fontFamily: Fonts.medium, color: Colors.outline },
    opTitulo: { ...Type.labelLg, color: Colors.onSurface },
    opLinha: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
    opTexto: { ...Type.bodySm, color: Colors.onSurfaceVariant, flexShrink: 1 },
    opValor: { ...Type.labelLg, fontFamily: Fonts.bold, color: Colors.primary },
    evento: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingHorizontal: Spacing.md, paddingVertical: 12 },
    eventoIcone: {
        width: 36,
        height: 36,
        borderRadius: Radius.full,
        backgroundColor: Colors.primaryFixed,
        alignItems: 'center',
        justifyContent: 'center',
    },
    eventoTitulo: { ...Type.labelLg, color: Colors.onSurface },
    eventoDescricao: { ...Type.bodySm, color: Colors.onSurfaceVariant },
    eventoHora: { ...Type.labelSm, fontFamily: Fonts.medium, color: Colors.outline, minWidth: 56, textAlign: 'right' },
});
