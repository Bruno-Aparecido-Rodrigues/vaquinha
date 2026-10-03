import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import CampanhaImage from './campanha-image';
import ProgressBar from './progress-bar';
import Button from './button';
import Icon from './icon';
import { Campanha } from '@/@types/campanha';
import { formatarMoedaCurta, percentual, podeDoar, textoPrazo } from '@/utils/format';
import { Colors } from '@/constants/colors';
import { Fonts, Radius, Shadow, Spacing, Type } from '@/constants/theme';

/** Card da tela Explorar: foto, título, meta com barra de progresso e botão Apoiar. */
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
            <View style={styles.imagemBox}>
                <CampanhaImage uri={campanha.imagemUrl} />
                <View style={styles.prazo}>
                    <Icon name="schedule" size={14} color={Colors.tertiary} />
                    <Text style={styles.prazoTexto}>{textoPrazo(campanha.dataLimite)}</Text>
                </View>
            </View>

            <View style={styles.corpo}>
                <View style={styles.cabecalho}>
                    <Text style={styles.criador} numberOfLines={1}>{campanha.criadorNome}</Text>
                    <Text style={styles.titulo} numberOfLines={1}>{campanha.titulo}</Text>
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
    imagemBox: { width: '100%', aspectRatio: 16 / 10, backgroundColor: Colors.surfaceContainer },
    prazo: {
        position: 'absolute',
        top: Spacing.sm,
        right: Spacing.sm,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: Radius.full,
        backgroundColor: 'rgba(235, 231, 228, 0.92)',
        ...Shadow.sm,
    },
    prazoTexto: { ...Type.labelSm, color: Colors.onSurface },
    corpo: { flex: 1, padding: Spacing.md, gap: Spacing.md, justifyContent: 'space-between' },
    cabecalho: { gap: Spacing.xs },
    criador: { ...Type.labelSm, fontFamily: Fonts.medium, color: Colors.onSurfaceVariant },
    titulo: { ...Type.headlineSm, color: Colors.onSurface },
    rodape: { gap: Spacing.sm },
    progresso: { gap: 6 },
    valores: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
    arrecadado: { fontFamily: Fonts.bold, fontSize: 14, color: Colors.onSurface },
    meta: { fontFamily: Fonts.regular, fontSize: 12, color: Colors.onSurfaceVariant },
    pct: { ...Type.labelSm, fontSize: 12, color: Colors.primary },
    botao: { paddingVertical: 10 },
});
