import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import ProgressBar from './progress-bar';
import Button from './button';
import Icon from './icon';
import { Campanha } from '@/@types/campanha';
import { formatarMoedaCurta, percentual, podeDoar, textoPrazo } from '@/utils/format';
import { Colors } from '@/constants/colors';
import { Fonts, Radius, Shadow, Spacing, Type } from '@/constants/theme';

/** Card da tela Explorar: criador, prazo, título, meta com barra de progresso e botão Apoiar. */
export default function CampanhaCard({ campanha }: { campanha: Campanha }) {
    const pct = percentual(campanha.valorArrecadado, campanha.meta);
    const aberta = podeDoar(campanha);
    const abrir = () => router.push(`/campanha/${campanha.id}`);

    let textoBotao = 'Apoiar';
    if (!aberta) {
        textoBotao = campanha.status === 'META_ATINGIDA' || pct >= 100 ? 'Meta atingida' : 'Encerrada';
    }

    return (
        <Pressable onPress={abrir} style={({ pressed }) => [styles.card, pressed && styles.pressionado]}>
            <View style={styles.corpo}>
                <View style={styles.cabecalho}>
                    <View style={styles.topo}>
                        <Text style={styles.criador} numberOfLines={1}>{campanha.criadorNome}</Text>
                        <View style={styles.prazo}>
                            <Icon name="schedule" size={14} color={Colors.tertiary} />
                            <Text style={styles.prazoTexto}>{textoPrazo(campanha.dataLimite)}</Text>
                        </View>
                    </View>
                    <Text style={styles.titulo} numberOfLines={2}>{campanha.titulo}</Text>
                    <Text style={styles.descricao} numberOfLines={3}>{campanha.descricao}</Text>
                </View>

                <View style={styles.rodape}>
                    <View style={styles.progresso}>
                        <View style={styles.valores}>
                            <Text style={styles.arrecadado}>
                                {formatarMoedaCurta(campanha.valorArrecadado)}{' '}
                                <Text style={styles.meta}>de {formatarMoedaCurta(campanha.meta)}</Text>
                            </Text>
                            <Text style={styles.pct}>{pct}%</Text>
                        </View>
                        <ProgressBar percentual={pct} />
                    </View>
                    <Button title={textoBotao} tamanho="sm" onPress={abrir} disabled={!aberta} style={styles.botao} />
                </View>
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    card: {
        flex: 1,
        backgroundColor: Colors.surfaceContainerLowest,
        borderRadius: Radius.xxl,
        overflow: 'hidden',
        ...Shadow.sm,
    },
    pressionado: { transform: [{ translateY: -2 }], ...Shadow.md },
    topo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.sm },
    prazo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: Radius.full,
        backgroundColor: Colors.surfaceContainerHigh,
    },
    prazoTexto: { ...Type.labelSm, color: Colors.onSurface },
    corpo: { flex: 1, padding: Spacing.md, gap: Spacing.md, justifyContent: 'space-between' },
    cabecalho: { gap: Spacing.xs },
    criador: { ...Type.labelSm, fontFamily: Fonts.medium, color: Colors.onSurfaceVariant, flexShrink: 1 },
    titulo: { ...Type.headlineSm, color: Colors.onSurface },
    descricao: { ...Type.bodySm, color: Colors.onSurfaceVariant },
    rodape: { gap: Spacing.sm },
    progresso: { gap: 6 },
    valores: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
    arrecadado: { fontFamily: Fonts.bold, fontSize: 14, color: Colors.onSurface },
    meta: { fontFamily: Fonts.regular, fontSize: 12, color: Colors.onSurfaceVariant },
    pct: { ...Type.labelSm, fontSize: 12, color: Colors.primary },
    botao: { paddingVertical: 10 },
});
