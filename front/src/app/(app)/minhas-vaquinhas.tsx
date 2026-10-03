import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import Screen, { Container } from '@/components/screen';
import CampanhaImage from '@/components/campanha-image';
import ProgressBar from '@/components/progress-bar';
import Button from '@/components/button';
import Icon, { IconName } from '@/components/icon';
import ConfirmDialog from '@/components/confirm-dialog';
import { EmptyView, ErrorView, LoadingView } from '@/components/state-views';
import { Campanha } from '@/@types/campanha';
import { encerrarCampanha, excluirCampanha, listarMinhasCampanhas } from '@/integration/campanhaIntegration';
import { useToast } from '@/context/ToastContext';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { formatarMoedaCurta, percentual, textoPrazo } from '@/utils/format';
import { mensagemErro } from '@/utils/errors';
import { Colors } from '@/constants/colors';
import { Fonts, Radius, Shadow, Spacing, Type } from '@/constants/theme';

type Filtro = 'todas' | 'ativas' | 'encerradas';
type Acao = { tipo: 'encerrar' | 'excluir'; campanha: Campanha } | null;

const estaAtiva = (c: Campanha) => c.status !== 'ENCERRADA';

export default function MinhasVaquinhas() {
    const { isSm } = useBreakpoint();
    const { showToast } = useToast();
    const [campanhas, setCampanhas] = useState<Campanha[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState<string | null>(null);
    const [filtro, setFiltro] = useState<Filtro>('todas');
    const [acao, setAcao] = useState<Acao>(null);
    const [executando, setExecutando] = useState(false);

    const carregar = useCallback(async () => {
        setErro(null);
        try {
            const lista = await listarMinhasCampanhas();
            lista.sort((a, b) => new Date(b.dataCriacao).getTime() - new Date(a.dataCriacao).getTime());
            setCampanhas(lista);
        } catch (e) {
            setErro(mensagemErro(e, 'Não foi possível carregar suas vaquinhas.'));
        } finally {
            setCarregando(false);
        }
    }, []);

    useFocusEffect(useCallback(() => { carregar(); }, [carregar]));

    const contagem = useMemo(() => ({
        todas: campanhas.length,
        ativas: campanhas.filter(estaAtiva).length,
        encerradas: campanhas.filter(c => !estaAtiva(c)).length,
    }), [campanhas]);

    const visiveis = campanhas.filter(c =>
        filtro === 'todas' ? true : filtro === 'ativas' ? estaAtiva(c) : !estaAtiva(c));

    async function confirmarAcao() {
        if (!acao) return;
        setExecutando(true);
        try {
            if (acao.tipo === 'encerrar') {
                await encerrarCampanha(acao.campanha.id);
                showToast({ titulo: 'Campanha encerrada', descricao: 'Novas doações foram interrompidas.' });
            } else {
                await excluirCampanha(acao.campanha.id);
                showToast({ titulo: 'Vaquinha excluída', descricao: `"${acao.campanha.titulo}" foi removida.`, icone: 'delete' });
            }
            setAcao(null);
            carregar();
        } catch (e) {
            showToast({ titulo: 'Não foi possível concluir', descricao: mensagemErro(e), tipo: 'erro' });
        } finally {
            setExecutando(false);
        }
    }

    return (
        <Screen ativo="minhas-vaquinhas">
            <Container style={styles.pagina}>
                {/* Cabeçalho */}
                <View style={[styles.topo, isSm && styles.topoSm]}>
                    <View style={{ flexShrink: 1 }}>
                        <View style={styles.sobretitulo}>
                            <Icon name="spa" size={18} color={Colors.secondary} />
                            <Text style={styles.sobretituloTexto}>PAINEL DO ORGANIZADOR</Text>
                        </View>
                        <Text style={styles.h1}>Minhas Campanhas</Text>
                        <Text style={styles.subtitulo}>Gerencie suas arrecadações, acompanhe as metas e atualize seus apoiadores.</Text>
                    </View>
                    <Button
                        title="Nova Campanha"
                        icone="add"
                        onPress={() => router.push('/vaquinha/nova')}
                        style={styles.botaoNova}
                    />
                </View>

                {/* Filtros */}
                <View style={styles.filtros}>
                    <FiltroChip texto={`Todas as campanhas (${contagem.todas})`} ativo={filtro === 'todas'} onPress={() => setFiltro('todas')} />
                    <FiltroChip texto={`Ativas (${contagem.ativas})`} ativo={filtro === 'ativas'} onPress={() => setFiltro('ativas')} />
                    <FiltroChip texto={`Encerradas (${contagem.encerradas})`} ativo={filtro === 'encerradas'} onPress={() => setFiltro('encerradas')} />
                </View>

                {carregando ? (
                    <LoadingView texto="Carregando suas vaquinhas..." />
                ) : erro ? (
                    <ErrorView mensagem={erro} onRetry={() => { setCarregando(true); carregar(); }} />
                ) : visiveis.length === 0 ? (
                    <EmptyView
                        icone="spa"
                        titulo={campanhas.length === 0 ? 'Você ainda não criou nenhuma vaquinha' : 'Nada por aqui'}
                        descricao={campanhas.length === 0 ? 'Crie sua primeira campanha e comece a arrecadar.' : 'Nenhuma campanha neste filtro.'}
                        acao={campanhas.length === 0
                            ? <Button title="Criar minha primeira vaquinha" icone="add" onPress={() => router.push('/vaquinha/nova')} />
                            : undefined}
                    />
                ) : (
                    <View style={styles.lista}>
                        {visiveis.map(c => (
                            <LinhaCampanha
                                key={c.id}
                                campanha={c}
                                onEncerrar={() => setAcao({ tipo: 'encerrar', campanha: c })}
                                onExcluir={() => setAcao({ tipo: 'excluir', campanha: c })}
                            />
                        ))}
                    </View>
                )}
            </Container>

            <ConfirmDialog
                visible={acao !== null}
                titulo={acao?.tipo === 'excluir' ? 'Excluir vaquinha?' : 'Encerrar arrecadação?'}
                mensagem={acao?.tipo === 'excluir'
                    ? 'Tem certeza de que deseja excluir esta campanha? Esta ação é permitida pois a vaquinha ainda não recebeu nenhuma doação.'
                    : 'Deseja realmente encerrar a arrecadação desta campanha? Novas doações serão interrompidas, mas o histórico permanecerá visível.'}
                textoConfirmar={acao?.tipo === 'excluir' ? 'Excluir' : 'Encerrar'}
                icone={acao?.tipo === 'excluir' ? 'delete' : 'highlight-off'}
                perigo={acao?.tipo === 'excluir'}
                loading={executando}
                onConfirmar={confirmarAcao}
                onCancelar={() => setAcao(null)}
            />
        </Screen>
    );
}

function FiltroChip({ texto, ativo, onPress }: { texto: string; ativo: boolean; onPress: () => void }) {
    return (
        <Pressable onPress={onPress} style={[styles.filtro, ativo && styles.filtroAtivo]}>
            <Text style={[styles.filtroTexto, ativo && styles.filtroTextoAtivo]}>{texto}</Text>
        </Pressable>
    );
}

function LinhaCampanha({ campanha, onEncerrar, onExcluir }: {
    campanha: Campanha;
    onEncerrar: () => void;
    onExcluir: () => void;
}) {
    const { isLg, isSm } = useBreakpoint();
    const pct = percentual(campanha.valorArrecadado, campanha.meta);
    const ativa = estaAtiva(campanha);
    const temDoacoes = campanha.totalDoacoes > 0;
    const metaBatida = campanha.status === 'META_ATINGIDA' || pct >= 100;

    const selo: { texto: string; icone?: IconName; fundo: string; cor: string } = !ativa
        ? { texto: 'Encerrada', icone: 'check-circle', fundo: Colors.secondaryFixed, cor: Colors.onSecondaryFixed }
        : metaBatida
            ? { texto: 'Meta atingida', icone: 'celebration', fundo: Colors.primaryFixed, cor: Colors.onPrimaryFixed }
            : { texto: 'Ativa', fundo: 'rgba(255, 255, 255, 0.92)', cor: Colors.primary };

    let apoio: { icone: IconName; texto: string };
    if (!ativa) apoio = { icone: 'volunteer-activism', texto: `Finalizada com ${campanha.totalDoacoes} ${campanha.totalDoacoes === 1 ? 'apoiador' : 'apoiadores'}` };
    else if (temDoacoes) apoio = { icone: 'group', texto: `${campanha.totalDoacoes} ${campanha.totalDoacoes === 1 ? 'doador engajado' : 'doadores engajados'}` };
    else apoio = { icone: 'hourglass-empty', texto: 'Aguardando primeiro doador' };

    let aviso: { icone: IconName; texto: string; cor: string };
    if (!ativa) aviso = { icone: 'verified', texto: 'Arrecadação encerrada. O histórico continua visível para os apoiadores.', cor: Colors.onSurfaceVariant };
    else if (temDoacoes) aviso = { icone: 'lock', texto: 'Exclusão bloqueada pois a campanha já recebeu doações.', cor: Colors.onSurfaceVariant };
    else aviso = { icone: 'info', texto: 'Nenhuma doação recebida ainda. Você pode excluir esta vaquinha livremente.', cor: Colors.secondary };

    const corBarra = !ativa || metaBatida ? Colors.tertiary : Colors.primary;

    return (
        <View style={[styles.linha, !ativa && { opacity: 0.95 }]}>
            <View style={[styles.linhaInner, isLg && styles.linhaInnerLg]}>
                {/* Foto + selo */}
                <View style={[styles.foto, isLg && styles.fotoLg]}>
                    <CampanhaImage uri={campanha.imagemUrl} cinza={!ativa} />
                    <View style={[styles.selo, { backgroundColor: selo.fundo }]}>
                        {selo.icone ? <Icon name={selo.icone} size={14} color={selo.cor} /> : <View style={styles.seloPonto} />}
                        <Text style={[styles.seloTexto, { color: selo.cor }]}>{selo.texto}</Text>
                    </View>
                </View>

                {/* Informações */}
                <View style={styles.info}>
                    <View style={styles.infoTopo}>
                        <Text style={styles.prazo}>{ativa ? textoPrazo(campanha.dataLimite).toUpperCase() : 'ENCERRADA'}</Text>
                        <Text style={styles.ponto}>•</Text>
                        <View style={styles.iconeTexto}>
                            <Icon name={apoio.icone} size={16} color={Colors.tertiary} />
                            <Text style={styles.apoio}>{apoio.texto}</Text>
                        </View>
                    </View>
                    <Text style={styles.titulo} numberOfLines={1}>{campanha.titulo}</Text>
                    <ProgressBar percentual={pct} altura={10} cor={corBarra} inset />
                    <View style={styles.valores}>
                        <Text style={[styles.arrecadado, { color: corBarra }]}>
                            {formatarMoedaCurta(campanha.valorArrecadado)}{' '}
                            <Text style={styles.de}>
                                {metaBatida ? 'meta atingida de' : 'arrecadados de'} {formatarMoedaCurta(campanha.meta)}
                            </Text>
                        </Text>
                        <View style={[styles.pctPill, metaBatida && { backgroundColor: 'rgba(188, 239, 190, 0.6)' }]}>
                            <Text style={[styles.pctTexto, metaBatida && { color: Colors.onTertiaryFixedVariant }]}>
                                {pct}% {metaBatida ? 'arrecadado' : 'da meta'}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.aviso}>
                        <Icon name={aviso.icone} size={15} color={aviso.cor} />
                        <Text style={[styles.avisoTexto, { color: aviso.cor }]}>{aviso.texto}</Text>
                    </View>
                </View>

                {/* Ações */}
                <View style={[styles.acoes, isSm && !isLg && styles.acoesSm, isLg && styles.acoesLg]}>
                    {ativa ? (
                        <>
                            <Button title="Editar" icone="tune" variante="suave" tamanho="sm" style={styles.acao}
                                    onPress={() => router.push(`/vaquinha/${campanha.id}/editar`)} />
                            <Button title="Encerrar" icone="highlight-off" variante="tonal" tamanho="sm" style={styles.acao}
                                    onPress={onEncerrar} />
                            {!temDoacoes ? (
                                <Button title="Excluir" icone="delete" variante="perigo" tamanho="sm" style={styles.acao}
                                        onPress={onExcluir} />
                            ) : null}
                        </>
                    ) : (
                        <Button title="Visualizar" icone="visibility" variante="tonal" tamanho="sm" style={styles.acao}
                                onPress={() => router.push(`/campanha/${campanha.id}`)} />
                    )}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    pagina: { paddingVertical: Spacing.xl },
    topo: { gap: Spacing.md, marginBottom: Spacing.xl },
    topoSm: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    sobretitulo: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, marginBottom: Spacing.xs },
    sobretituloTexto: { ...Type.labelSm, fontFamily: Fonts.semibold, letterSpacing: 1.2, color: Colors.secondary },
    h1: { ...Type.headlineLg, color: Colors.onSurface },
    subtitulo: { ...Type.bodySm, color: Colors.onSurfaceVariant, marginTop: 4 },
    botaoNova: { alignSelf: 'flex-start', borderRadius: Radius.xxl },
    filtros: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.lg },
    filtro: {
        paddingHorizontal: Spacing.md,
        paddingVertical: 8,
        borderRadius: Radius.full,
        backgroundColor: Colors.surfaceContainerLow,
    },
    filtroAtivo: { backgroundColor: Colors.surfaceContainerHigh, ...Shadow.sm },
    filtroTexto: { ...Type.labelMd, color: Colors.onSurfaceVariant },
    filtroTextoAtivo: { color: Colors.onSurface },
    lista: { gap: Spacing.lg },
    linha: {
        backgroundColor: Colors.surfaceContainerLowest,
        borderRadius: Radius.xxxl,
        padding: Spacing.lg,
        overflow: 'hidden',
        ...Shadow.sm,
    },
    linhaInner: { gap: Spacing.lg },
    linhaInnerLg: { flexDirection: 'row', alignItems: 'center' },
    foto: { width: '100%', height: 160, borderRadius: Radius.xxl, overflow: 'hidden' },
    fotoLg: { width: 192 },
    selo: {
        position: 'absolute',
        top: 12,
        left: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: Radius.full,
        ...Shadow.sm,
    },
    seloPonto: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary },
    seloTexto: { ...Type.labelSm },
    info: { flex: 1, minWidth: 0, gap: Spacing.sm },
    infoTopo: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', columnGap: Spacing.md, rowGap: 2 },
    prazo: { ...Type.labelSm, fontFamily: Fonts.semibold, letterSpacing: 1, color: Colors.secondary },
    ponto: { ...Type.labelSm, color: Colors.outlineVariant },
    iconeTexto: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    apoio: { ...Type.bodySm, color: Colors.onSurfaceVariant },
    titulo: { ...Type.headlineSm, fontFamily: Fonts.bold, color: Colors.onSurface, marginBottom: Spacing.xs },
    valores: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'baseline', gap: Spacing.xs },
    arrecadado: { ...Type.headlineSm, fontFamily: Fonts.extrabold },
    de: { ...Type.bodySm, color: Colors.onSurfaceVariant },
    pctPill: { backgroundColor: 'rgba(180, 242, 179, 0.3)', paddingHorizontal: 10, paddingVertical: 2, borderRadius: Radius.full },
    pctTexto: { ...Type.labelMd, fontFamily: Fonts.bold, color: Colors.primary },
    aviso: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
    avisoTexto: { ...Type.labelSm, fontFamily: Fonts.medium, flexShrink: 1 },
    acoes: { gap: 10 },
    acoesSm: { flexDirection: 'row' },
    acoesLg: { width: 176 },
    acao: { flexGrow: 1, paddingVertical: 10 },
});
