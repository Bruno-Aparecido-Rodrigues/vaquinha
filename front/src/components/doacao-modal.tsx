import React, { useEffect, useRef, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import axios from 'axios';
import Button, { IconButton } from './button';
import Icon from './icon';
import TextField from './text-field';
import { Campanha } from '@/@types/campanha';
import { DoacaoErro, DoacaoResponse } from '@/@types/doacao';
import { doar } from '@/integration/doacaoIntegration';
import { formatarMoeda, parseValor, valorRestante } from '@/utils/format';
import { mensagemErro } from '@/utils/errors';
import { Colors } from '@/constants/colors';
import { Fonts, Radius, Shadow, Spacing, Type } from '@/constants/theme';

type Props = {
    visible: boolean;
    campanha: Campanha;
    onClose: () => void;
    onConcluida: (resposta: DoacaoResponse) => void;
    /** Chamado quando o backend recusa por concorrência, para a tela recarregar os valores. */
    onRecusada?: () => void;
};

type Alerta =
    | { tipo: 'concorrencia'; mensagem: string; restante: number }
    | { tipo: 'meta'; mensagem: string }
    | { tipo: 'erro'; mensagem: string };

const VALORES_RAPIDOS = [10, 50, 100];
const VALOR_MINIMO = 1;

export default function DoacaoModal({ visible, campanha, onClose, onConcluida, onRecusada }: Props) {
    const [valorTexto, setValorTexto] = useState('50');
    const [chip, setChip] = useState<number | 'outro'>(50);
    const [restante, setRestante] = useState(valorRestante(campanha));
    const [enviando, setEnviando] = useState(false);
    const [alerta, setAlerta] = useState<Alerta | null>(null);
    const inputRef = useRef<TextInput>(null);

    // Sempre que abrir, recomeça com os valores atuais da campanha
    useEffect(() => {
        if (!visible) return;
        const r = valorRestante(campanha);
        const inicial = Math.min(50, r);
        setRestante(r);
        setValorTexto(String(inicial).replace('.', ','));
        setChip(VALORES_RAPIDOS.includes(inicial) ? inicial : 'outro');
        setAlerta(null);
        setEnviando(false);
    }, [visible, campanha]);

    const valor = parseValor(valorTexto);
    const excede = valor > restante;
    const abaixoDoMinimo = valor < VALOR_MINIMO;
    const metaFechada = restante <= 0;
    const podeConfirmar = !excede && !abaixoDoMinimo && !metaFechada && !enviando;

    function escolherChip(v: number | 'outro') {
        setChip(v);
        setAlerta(null);
        if (v === 'outro') {
            inputRef.current?.focus();
        } else {
            setValorTexto(String(v));
        }
    }

    function ajustarPara(v: number) {
        setValorTexto(String(v).replace('.', ','));
        setChip(VALORES_RAPIDOS.includes(v) ? v : 'outro');
        setAlerta(null);
    }

    async function confirmar() {
        if (!podeConfirmar) return;
        setEnviando(true);
        setAlerta(null);
        try {
            const resposta = await doar(campanha.id, valor);
            onConcluida(resposta);
        } catch (e) {
            const status = axios.isAxiosError(e) ? e.response?.status : undefined;
            const data = (axios.isAxiosError(e) ? e.response?.data : undefined) as DoacaoErro | undefined;

            if ((status === 409 || status === 422) && data) {
                const novoRestante = data.valorRestante ?? restante;
                setRestante(novoRestante);
                onRecusada?.();

                if (data.motivo === 'META_ATINGIDA' || novoRestante <= 0) {
                    setAlerta({ tipo: 'meta', mensagem: 'A meta foi atingida enquanto você doava. Obrigado pela intenção de apoiar!' });
                } else if (data.motivo === 'VALOR_EXCEDE_META') {
                    setAlerta({
                        tipo: 'concorrencia',
                        mensagem: `Alguém doou ao mesmo tempo que você! Agora faltam só ${formatarMoeda(novoRestante)} para completar a meta.`,
                        restante: novoRestante,
                    });
                } else {
                    setAlerta({ tipo: 'erro', mensagem: data.mensagem ?? 'Esta vaquinha não está mais aceitando doações.' });
                }
            } else {
                setAlerta({ tipo: 'erro', mensagem: mensagemErro(e, 'Não foi possível concluir a doação.') });
            }
        } finally {
            setEnviando(false);
        }
    }

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <Pressable style={StyleSheet.absoluteFill} onPress={enviando ? undefined : onClose} />
                <View style={styles.card}>
                    <ScrollView contentContainerStyle={styles.conteudo} keyboardShouldPersistTaps="handled">
                        <View style={styles.fechar}>
                            <IconButton icone="close" label="Fechar" onPress={onClose} />
                        </View>

                        <View style={styles.cabecalho}>
                            <Text style={styles.titulo}>Fazer uma Doação</Text>
                            <Text style={styles.subtitulo} numberOfLines={2}>{campanha.titulo}</Text>
                        </View>

                        {/* Quanto falta: é o "estoque" disputado pelos doadores */}
                        <View style={styles.faltam}>
                            <Icon name="flag" size={18} color={Colors.secondary} />
                            <Text style={styles.faltamTexto}>
                                {metaFechada ? 'A meta desta vaquinha já foi atingida' : `Faltam ${formatarMoeda(restante)} para a meta`}
                            </Text>
                        </View>

                        {alerta ? <AlertaBox alerta={alerta} onAjustar={ajustarPara} /> : null}

                        <View style={styles.secao}>
                            <View style={styles.labelRow}>
                                <Text style={styles.label}>Selecione ou digite a quantia</Text>
                                <Text style={styles.labelDica}>Valor em Reais (BRL)</Text>
                            </View>
                            <View style={styles.chips}>
                                {VALORES_RAPIDOS.map(v => (
                                    <Chip key={v} texto={`R$ ${v}`} ativo={chip === v} onPress={() => escolherChip(v)} desabilitado={v > restante} />
                                ))}
                                <Chip texto="Outro" ativo={chip === 'outro'} onPress={() => escolherChip('outro')} pequeno />
                            </View>
                            <TextField
                                ref={inputRef}
                                prefixo="R$"
                                grande
                                value={valorTexto}
                                onChangeText={t => { setValorTexto(t.replace(/[^\d,.]/g, '')); setChip('outro'); setAlerta(null); }}
                                keyboardType="decimal-pad"
                                placeholder="0,00"
                                erro={excede || (abaixoDoMinimo && valorTexto !== '')}
                                direita={
                                    <View style={styles.seguro}>
                                        <Icon name="lock" size={16} color={Colors.primary} />
                                        <Text style={styles.seguroTexto}>Transação segura</Text>
                                    </View>
                                }
                            />
                            {excede && !metaFechada ? (
                                <Pressable onPress={() => ajustarPara(restante)}>
                                    <Text style={styles.dicaErro}>
                                        O valor passa do que falta para a meta. <Text style={styles.link}>Doar {formatarMoeda(restante)}</Text>
                                    </Text>
                                </Pressable>
                            ) : null}
                            {abaixoDoMinimo && valorTexto !== '' ? (
                                <Text style={styles.dicaErro}>O valor mínimo é {formatarMoeda(VALOR_MINIMO)}.</Text>
                            ) : null}
                        </View>

                        <Button
                            tamanho="lg"
                            icone="favorite"
                            title={enviando ? 'Processando doação...' : `Confirmar Doação de ${formatarMoeda(valor)}`}
                            onPress={confirmar}
                            loading={enviando}
                            disabled={!podeConfirmar}
                        />
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}

function Chip({ texto, ativo, onPress, desabilitado, pequeno }: {
    texto: string;
    ativo: boolean;
    onPress: () => void;
    desabilitado?: boolean;
    pequeno?: boolean;
}) {
    return (
        <Pressable
            onPress={onPress}
            disabled={desabilitado}
            style={({ pressed }) => [
                styles.chip,
                ativo && styles.chipAtivo,
                pressed && { backgroundColor: Colors.surfaceContainerHigh },
                desabilitado && { opacity: 0.4 },
            ]}
        >
            <Text style={[pequeno ? styles.chipTextoPequeno : styles.chipTexto, ativo && { color: Colors.onPrimaryFixed }]}>
                {texto}
            </Text>
        </Pressable>
    );
}

/** Caixa de alerta de concorrência (o "REAL-TIME CONCURRENCY ALERT BOX" do mockup). */
function AlertaBox({ alerta, onAjustar }: { alerta: Alerta; onAjustar: (v: number) => void }) {
    const estilo = alerta.tipo === 'concorrencia'
        ? { fundo: Colors.warningContainer, texto: Colors.onWarningContainer, icone: 'bolt' as const, titulo: 'Doação simultânea detectada' }
        : alerta.tipo === 'meta'
            ? { fundo: Colors.primaryFixed, texto: Colors.onPrimaryFixed, icone: 'celebration' as const, titulo: 'Meta atingida!' }
            : { fundo: Colors.errorContainer, texto: Colors.onErrorContainer, icone: 'error' as const, titulo: 'Doação não concluída' };

    return (
        <View style={[styles.alerta, { backgroundColor: estilo.fundo }]}>
            <Icon name={estilo.icone} size={22} color={estilo.texto} />
            <View style={styles.alertaTextos}>
                <Text style={[styles.alertaTitulo, { color: estilo.texto }]}>{estilo.titulo}</Text>
                <Text style={[styles.alertaMensagem, { color: estilo.texto }]}>{alerta.mensagem}</Text>
                {alerta.tipo === 'concorrencia' ? (
                    <Pressable onPress={() => onAjustar(alerta.restante)} style={styles.alertaBotao}>
                        <Text style={styles.alertaBotaoTexto}>Ajustar para {formatarMoeda(alerta.restante)}</Text>
                    </Pressable>
                ) : null}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(49, 48, 46, 0.6)',
        alignItems: 'center',
        justifyContent: 'center',
        padding: Spacing.md,
    },
    card: {
        width: '100%',
        maxWidth: 560,
        maxHeight: '92%',
        backgroundColor: Colors.surface,
        borderRadius: Radius.xl,
        ...Shadow.xl,
    },
    conteudo: { padding: Spacing.lg, gap: Spacing.md },
    fechar: { position: 'absolute', top: 16, right: 16, zIndex: 2 },
    cabecalho: { paddingRight: 40, gap: 4 },
    titulo: { ...Type.headlineLg, color: Colors.onSurface },
    subtitulo: { ...Type.bodySm, color: Colors.onSurfaceVariant },
    faltam: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: Colors.surfaceContainerLow,
        borderRadius: Radius.xl,
        paddingHorizontal: Spacing.md,
        paddingVertical: 10,
    },
    faltamTexto: { ...Type.labelMd, color: Colors.secondary },
    secao: { gap: Spacing.sm },
    labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 4 },
    label: { ...Type.labelLg, color: Colors.onSurface },
    labelDica: { ...Type.labelSm, color: Colors.onSurfaceVariant },
    chips: { flexDirection: 'row', gap: Spacing.xs },
    chip: {
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 4,
        borderRadius: Radius.xl,
        backgroundColor: Colors.surfaceContainer,
        alignItems: 'center',
        justifyContent: 'center',
    },
    chipAtivo: { backgroundColor: Colors.primaryFixed, ...Shadow.sm },
    chipTexto: { ...Type.headlineSm, color: Colors.onSurface },
    chipTextoPequeno: { ...Type.labelMd, color: Colors.onSurface },
    seguro: { flexDirection: 'row', alignItems: 'center', gap: 4, marginLeft: 8 },
    seguroTexto: { ...Type.labelSm, color: Colors.primary },
    dicaErro: { ...Type.bodySm, color: Colors.error },
    link: { fontFamily: Fonts.bold, textDecorationLine: 'underline' },
    alerta: { flexDirection: 'row', gap: 10, padding: Spacing.md, borderRadius: Radius.xl },
    alertaTextos: { flex: 1, gap: 2 },
    alertaTitulo: { ...Type.labelLg, fontFamily: Fonts.bold },
    alertaMensagem: { ...Type.bodySm },
    alertaBotao: {
        alignSelf: 'flex-start',
        marginTop: 8,
        backgroundColor: Colors.surfaceContainerLowest,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: Radius.lg,
        ...Shadow.sm,
    },
    alertaBotaoTexto: { ...Type.labelMd, color: Colors.onWarningContainer },
});
