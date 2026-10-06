import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import Button from './button';
import Icon from './icon';
import TextField from './text-field';
import { Container } from './screen';
import { Campanha } from '@/@types/campanha';
import { atualizarCampanha, criarCampanha } from '@/integration/campanhaIntegration';
import { useToast } from '@/context/ToastContext';
import {
    dataBrParaIso, diasRestantes, formatarMoeda, formatarNumero, isoParaDataBr, mascaraData, mascaraMoeda, parseValor,
} from '@/utils/format';
import { mensagemErro } from '@/utils/errors';
import { Colors } from '@/constants/colors';
import { Fonts, Radius, Shadow, Spacing, Type } from '@/constants/theme';

const MAX_TITULO = 80;

/** Formulário único para criar e editar vaquinha (título, descrição, meta e data limite). */
export default function CampanhaForm({ campanha }: { campanha?: Campanha }) {
    const editando = !!campanha;
    const { showToast } = useToast();

    const [titulo, setTitulo] = useState(campanha?.titulo ?? '');
    const [descricao, setDescricao] = useState(campanha?.descricao ?? '');
    const [metaTexto, setMetaTexto] = useState(campanha ? formatarNumero(campanha.meta) : '');
    const [dataTexto, setDataTexto] = useState(campanha ? isoParaDataBr(campanha.dataLimite) : '');
    const [salvando, setSalvando] = useState(false);
    const [erroServidor, setErroServidor] = useState<string | null>(null);

    const metaMinima = campanha?.valorArrecadado ?? 0;
    const meta = parseValor(metaTexto);
    const dataIso = dataBrParaIso(dataTexto);
    const dias = dataIso ? diasRestantes(dataIso) : null;

    const metaAbaixo = editando && metaTexto !== '' && meta < metaMinima;

    // Primeiro problema encontrado (mostrado ao lado do botão Salvar)
    const problema = useMemo(() => {
        if (titulo.trim().length < 3) return 'Informe um título com pelo menos 3 caracteres';
        if (descricao.trim().length < 10) return 'Conte a história da vaquinha na descrição';
        if (meta <= 0) return 'Informe a meta de arrecadação';
        if (metaAbaixo) return 'Corrija o valor da meta para salvar';
        if (!dataIso) return 'Informe a data limite no formato dd/mm/aaaa';
        if (dias !== null && dias < 0) return 'A data limite não pode estar no passado';
        return null;
    }, [titulo, descricao, meta, metaAbaixo, dataIso, dias]);

    function voltar() {
        if (router.canGoBack()) router.back();
        else router.replace('/minhas-vaquinhas');
    }

    async function salvar() {
        if (problema || !dataIso) return;
        setSalvando(true);
        setErroServidor(null);
        const dados = {
            titulo: titulo.trim(),
            descricao: descricao.trim(),
            meta,
            dataLimite: dataIso,
        };
        try {
            if (campanha) {
                await atualizarCampanha({ id: campanha.id, ...dados });
                showToast({ titulo: 'Alterações salvas!', descricao: `A vaquinha "${dados.titulo}" foi atualizada.` });
            } else {
                await criarCampanha(dados);
                showToast({ titulo: 'Vaquinha criada!', descricao: 'Ela já aparece na tela Explorar.', icone: 'celebration' });
            }
            router.replace('/minhas-vaquinhas');
        } catch (e) {
            const msg = mensagemErro(e, 'Não foi possível salvar a vaquinha.');
            setErroServidor(msg);
            showToast({ titulo: 'Erro ao salvar', descricao: msg, tipo: 'erro' });
        } finally {
            setSalvando(false);
        }
    }

    return (
        <Container maxWidth={820} style={styles.pagina}>
            <View style={styles.topo}>
                <View style={styles.selo}>
                    <View style={styles.seloPonto} />
                    <Text style={styles.seloTexto}>{editando ? 'Modo de Edição' : 'Nova vaquinha'}</Text>
                    {campanha ? (
                        <>
                            <Text style={styles.seloSeparador}>•</Text>
                            <Text style={styles.seloTitulo} numberOfLines={1}>{campanha.titulo}</Text>
                        </>
                    ) : null}
                </View>
                <View style={styles.tituloRow}>
                    <Text style={styles.h1}>{editando ? 'Editar Campanha' : 'Criar Campanha'}</Text>
                    <Text style={styles.subtitulo}>
                        {editando
                            ? 'Ajuste os dados fundamentais para manter seus apoiadores informados.'
                            : 'Conte sua história e defina quanto você precisa arrecadar.'}
                    </Text>
                </View>
            </View>

            <View style={styles.form}>
                <TextField
                    label="Título da Vaquinha"
                    labelDireita={`${titulo.length}/${MAX_TITULO}`}
                    value={titulo}
                    onChangeText={setTitulo}
                    maxLength={MAX_TITULO}
                    placeholder="Ex: Cirurgia de emergência do Fred"
                />

                <TextField
                    label="História e Motivo da Vaquinha"
                    labelDireita="Explique com clareza o objetivo"
                    value={descricao}
                    onChangeText={setDescricao}
                    multiline
                    numberOfLines={5}
                    placeholder="Descreva quem será ajudado, quais os custos e a importância de cada contribuição..."
                />

                <View style={styles.grid}>
                    {/* META */}
                    <View style={styles.coluna}>
                        <View style={styles.metaLabelRow}>
                            <Text style={styles.label}>Meta de Arrecadação</Text>
                            {editando && metaMinima > 0 ? (
                                <View style={styles.pillMin}>
                                    <Text style={styles.pillMinTexto}>Mín. {formatarMoeda(metaMinima)}</Text>
                                </View>
                            ) : null}
                        </View>
                        <TextField
                            prefixo="R$"
                            grande
                            value={metaTexto}
                            onChangeText={t => setMetaTexto(mascaraMoeda(t))}
                            keyboardType="number-pad"
                            placeholder="0,00"
                            erro={metaAbaixo}
                        />
                        {metaAbaixo ? (
                            <View style={styles.bannerErro}>
                                <Icon name="error" size={20} color={Colors.error} />
                                <View style={styles.bannerTextos}>
                                    <Text style={styles.bannerTitulo}>Meta inferior ao total arrecadado</Text>
                                    <Text style={styles.bannerTexto}>
                                        Valor arrecadado até o momento: <Text style={styles.negrito}>{formatarMoeda(metaMinima)}</Text>.
                                        A nova meta não pode ser inferior a este valor.
                                    </Text>
                                    <Button
                                        title={`Definir para ${formatarMoeda(metaMinima)}`}
                                        tamanho="sm"
                                        variante="suave"
                                        onPress={() => setMetaTexto(formatarNumero(metaMinima))}
                                        style={styles.bannerBotao}
                                        textStyle={{ color: Colors.error }}
                                    />
                                </View>
                            </View>
                        ) : null}
                    </View>

                    {/* DATA LIMITE */}
                    <View style={styles.coluna}>
                        <TextField
                            label="Data Limite"
                            labelDireita="Encerramento da arrecadação"
                            value={dataTexto}
                            onChangeText={t => setDataTexto(mascaraData(t))}
                            keyboardType="number-pad"
                            placeholder="dd/mm/aaaa"
                            icone="event"
                            erro={dataTexto.length === 10 && (!dataIso || (dias !== null && dias < 0))}
                        />
                        <View style={styles.infoData}>
                            <Icon name="schedule" size={18} color={Colors.onSurfaceVariant} />
                            <Text style={styles.infoDataTexto}>
                                {dias === null
                                    ? 'Escolha até quando a vaquinha recebe doações.'
                                    : dias < 0
                                        ? 'Essa data já passou.'
                                        : dias === 0
                                            ? 'Encerra hoje.'
                                            : <>Restam <Text style={styles.negrito}>{dias} {dias === 1 ? 'dia' : 'dias'}</Text> até a finalização prevista.</>}
                            </Text>
                        </View>
                    </View>
                </View>

                {erroServidor ? (
                    <View style={styles.bannerErro}>
                        <Icon name="error" size={20} color={Colors.error} />
                        <Text style={[styles.bannerTexto, { flex: 1 }]}>{erroServidor}</Text>
                    </View>
                ) : null}

                <View style={styles.acoes}>
                    <Button title="Cancelar" variante="tonal" onPress={voltar} disabled={salvando} />
                    <View style={styles.acoesDireita}>
                        {problema ? <Text style={styles.hint}>{problema}</Text> : null}
                        <Button
                            title={editando ? 'Salvar Alterações' : 'Criar Vaquinha'}
                            icone="check"
                            onPress={salvar}
                            loading={salvando}
                            disabled={!!problema}
                            style={styles.botaoSalvar}
                        />
                    </View>
                </View>
            </View>
        </Container>
    );
}

const styles = StyleSheet.create({
    pagina: { paddingVertical: Spacing.xl },
    topo: { marginBottom: Spacing.lg, gap: Spacing.xs },
    selo: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        gap: Spacing.xs,
        maxWidth: '100%',
        paddingHorizontal: Spacing.sm,
        paddingVertical: 4,
        borderRadius: Radius.full,
        backgroundColor: Colors.surfaceContainerHigh,
    },
    seloPonto: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.primary },
    seloTexto: { ...Type.labelSm, color: Colors.onSurfaceVariant },
    seloSeparador: { ...Type.labelSm, color: Colors.outline },
    seloTitulo: { ...Type.labelSm, fontFamily: Fonts.medium, color: Colors.onSurface, flexShrink: 1 },
    tituloRow: { gap: Spacing.xs, flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap' },
    h1: { ...Type.headlineLg, color: Colors.onSurface },
    subtitulo: { ...Type.bodySm, color: Colors.onSurfaceVariant },
    form: {
        backgroundColor: Colors.surfaceContainerLowest,
        borderRadius: Radius.xl,
        padding: Spacing.xl,
        gap: Spacing.lg,
        ...Shadow.md,
    },
    grid: { gap: Spacing.md, flexDirection: 'row', alignItems: 'flex-start' },
    coluna: { flex: 1, gap: Spacing.xs },
    metaLabelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8, minHeight: 22 },
    label: { ...Type.labelLg, color: Colors.onSurface },
    pillMin: { backgroundColor: Colors.primaryFixed, paddingHorizontal: 8, paddingVertical: 2, borderRadius: Radius.full },
    pillMinTexto: { ...Type.labelSm, color: Colors.onPrimaryFixed },
    bannerErro: {
        flexDirection: 'row',
        gap: Spacing.xs,
        backgroundColor: Colors.errorContainer,
        borderRadius: Radius.xl,
        padding: Spacing.sm,
        marginTop: Spacing.xs,
    },
    bannerTextos: { flex: 1, gap: 2 },
    bannerTitulo: { ...Type.labelMd, fontFamily: Fonts.bold, color: Colors.onErrorContainer },
    bannerTexto: { ...Type.bodySm, color: Colors.onErrorContainer },
    bannerBotao: { alignSelf: 'flex-start', marginTop: 6, backgroundColor: Colors.surfaceContainerLowest },
    negrito: { fontFamily: Fonts.semibold },
    infoData: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
        padding: Spacing.sm,
        borderRadius: Radius.xl,
        backgroundColor: Colors.surfaceContainerLow,
        marginTop: Spacing.xs,
    },
    infoDataTexto: { ...Type.bodySm, color: Colors.onSurfaceVariant, flex: 1 },
    acoes: { paddingTop: Spacing.md, gap: Spacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    acoesDireita: { gap: Spacing.sm, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', flexShrink: 1 },
    hint: { ...Type.bodySm, fontFamily: Fonts.medium, color: Colors.error, flexShrink: 1, textAlign: 'right' },
    botaoSalvar: { paddingHorizontal: Spacing.xl, paddingVertical: 14 },
});
