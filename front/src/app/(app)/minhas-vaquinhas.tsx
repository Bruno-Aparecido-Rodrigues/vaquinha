import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import Screen, { Container } from '@/components/screen';
import ProgressBar from '@/components/progress-bar';
import Button from '@/components/button';
import Icon, { IconName } from '@/components/icon';
import ConfirmDialog from '@/components/confirm-dialog';
import { EmptyView, ErrorView, LoadingView } from '@/components/state-views';
import { Campanha } from '@/@types/campanha';
import { excluirCampanha, listarMinhasCampanhas } from '@/integration/campanhaIntegration';
import { diasRestantes, formatarMoedaCurta, percentual, textoPrazo } from '@/utils/format';
import { mensagemErro } from '@/utils/errors';
import { Colors } from '@/constants/colors';
import { Fonts, Radius, Shadow, Spacing, Type } from '@/constants/theme';


const estaAtiva = (c: Campanha) => c.status !== 'ENCERRADA';

export default function MinhasVaquinhas() {
    const [campanhas, setCampanhas] = useState<Campanha[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState<string | null>(null);
    const [excluindo, setExcluindo] = useState<Campanha | null>(null);
    const [executando, setExecutando] = useState(false);
    const [erroExclusao, setErroExclusao] = useState<string | null>(null);

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

    async function confirmarExclusao() {
        if (!excluindo) return;
        setExecutando(true);
        setErroExclusao(null);
        try {
            await excluirCampanha(excluindo.id);
            setExcluindo(null);
            carregar();
        } catch (e) {
            setExcluindo(null);
            setErroExclusao(mensagemErro(e, 'Não foi possível excluir a vaquinha.'));
        } finally {
            setExecutando(false);
        }
    }

    return (
        <Screen ativo="minhas-vaquinhas">
            <Container style={styles.pagina}>
                {/* Cabeçalho */}
                <View style={styles.topo}>
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

                {erroExclusao ? (
                    <View style={styles.bannerErro}>
                        <Icon name="error" size={18} color={Colors.error} />
                        <Text style={styles.bannerErroTexto}>{erroExclusao}</Text>
                    </View>
                ) : null}

                {carregando ? (
                    <LoadingView texto="Carregando suas vaquinhas..." />
                ) : erro ? (
                    <ErrorView mensagem={erro} onRetry={() => { setCarregando(true); carregar(); }} />
                ) : campanhas.length === 0 ? (
                    <EmptyView
                        icone="spa"
                        titulo="Você ainda não criou nenhuma vaquinha"
                        descricao="Crie sua primeira campanha e comece a arrecadar."
                        acao={<Button title="Criar minha primeira vaquinha" icone="add" onPress={() => router.push('/vaquinha/nova')} />}
                    />
                ) : (
                    <View style={styles.lista}>
                        {campanhas.map(c => (
                            <LinhaCampanha key={c.id} campanha={c} onExcluir={() => setExcluindo(c)} />
                        ))}
                    </View>
                )}
            </Container>

            <ConfirmDialog
                visible={excluindo !== null}
                titulo="Excluir vaquinha?"
                mensagem="Tem certeza de que deseja excluir esta campanha? Esta ação é permitida pois a vaquinha ainda não recebeu nenhuma doação."
                textoConfirmar="Excluir"
                icone="delete"
                perigo
                loading={executando}
                onConfirmar={confirmarExclusao}
                onCancelar={() => setExcluindo(null)}
            />
        </Screen>
    );
}

function LinhaCampanha({ campanha, onExcluir }: { campanha: Campanha; onExcluir: () => void }) {
    const pct = percentual(campanha.valorArrecadado, campanha.meta);
    const ativa = estaAtiva(campanha);
    const temDoacoes = campanha.totalDoacoes > 0;
    const metaBatida = campanha.status === 'META_ATINGIDA' || pct >= 100;
    const prazoVencido = diasRestantes(campanha.dataLimite) < 0;

    const selo: { texto: string; icone?: IconName; fundo: string; cor: string } = !ativa
        ? { texto: 'Encerrada', icone: 'check-circle', fundo: Colors.secondaryFixed, cor: Colors.onSecondaryFixed }
        : metaBatida
            ? { texto: 'Meta atingida', icone: 'celebration', fundo: Colors.primaryFixed, cor: Colors.onPrimaryFixed }
            : prazoVencido
                ? { texto: 'Prazo encerrado', icone: 'event-busy', fundo: Colors.secondaryFixed, cor: Colors.onSecondaryFixed }
                : { texto: 'Ativa', fundo: Colors.surfaceContainerHigh, cor: Colors.primary };

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
            <View style={styles.linhaInner}>
                {/* Informações */}
                <View style={styles.info}>
                    <View style={styles.infoTopo}>
                        <View style={[styles.selo, { backgroundColor: selo.fundo }]}>
                            {selo.icone ? <Icon name={selo.icone} size={14} color={selo.cor} /> : <View style={styles.seloPonto} />}
                            <Text style={[styles.seloTexto, { color: selo.cor }]}>{selo.texto}</Text>
                        </View>
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
                <View style={styles.acoes}>
                    {ativa ? (
                        <>
                            <Button title="Editar" icone="tune" variante="suave" tamanho="sm" style={styles.acao}
                                    onPress={() => router.push(`/vaquinha/${campanha.id}/editar`)} />
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
    topo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.md, marginBottom: Spacing.xl },
    sobretitulo: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, marginBottom: Spacing.xs },
    sobretituloTexto: { ...Type.labelSm, fontFamily: Fonts.semibold, letterSpacing: 1.2, color: Colors.secondary },
    h1: { ...Type.headlineLg, color: Colors.onSurface },
    subtitulo: { ...Type.bodySm, color: Colors.onSurfaceVariant, marginTop: 4 },
    botaoNova: { alignSelf: 'flex-start', borderRadius: Radius.xxl },
    bannerErro: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
        padding: Spacing.sm,
        marginBottom: Spacing.lg,
        borderRadius: Radius.xl,
        backgroundColor: Colors.errorContainer,
    },
    bannerErroTexto: { ...Type.bodySm, color: Colors.onErrorContainer, flex: 1 },
    lista: { gap: Spacing.lg },
    linha: {
        backgroundColor: Colors.surfaceContainerLowest,
        borderRadius: Radius.xxxl,
        padding: Spacing.lg,
        overflow: 'hidden',
        ...Shadow.sm,
    },
    linhaInner: { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg },
    selo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: Radius.full,
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
    acoes: { gap: 10, width: 176 },
    acao: { flexGrow: 1, paddingVertical: 10 },
});
