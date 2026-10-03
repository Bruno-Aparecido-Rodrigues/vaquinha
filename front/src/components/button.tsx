import React from 'react';
import { ActivityIndicator, Pressable, StyleProp, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';
import Icon, { IconName } from './icon';
import { Colors } from '@/constants/colors';
import { Radius, Shadow, Type } from '@/constants/theme';

type Variante = 'primario' | 'tonal' | 'suave' | 'perigo' | 'texto';
type Tamanho = 'sm' | 'md' | 'lg';

type Props = {
    title: string;
    onPress?: () => void;
    variante?: Variante;
    tamanho?: Tamanho;
    icone?: IconName;
    iconeDireita?: IconName;
    loading?: boolean;
    disabled?: boolean;
    style?: StyleProp<ViewStyle>;
    textStyle?: StyleProp<TextStyle>;
};

const CORES: Record<Variante, { fundo: string; texto: string }> = {
    primario: { fundo: Colors.primary, texto: Colors.onPrimary },
    tonal: { fundo: Colors.surfaceContainerHigh, texto: Colors.onSurface },
    suave: { fundo: Colors.surfaceContainerLow, texto: Colors.onSurface },
    perigo: { fundo: Colors.errorContainer, texto: Colors.onErrorContainer },
    texto: { fundo: Colors.transparent, texto: Colors.primary },
};

export default function Button({
    title,
    onPress,
    variante = 'primario',
    tamanho = 'md',
    icone,
    iconeDireita,
    loading = false,
    disabled = false,
    style,
    textStyle,
}: Props) {
    const cores = CORES[variante];
    const inativo = disabled || loading;
    const tipografia = tamanho === 'lg' ? Type.headlineSm : tamanho === 'sm' ? Type.labelMd : Type.labelLg;
    const tamIcone = tamanho === 'lg' ? 24 : 18;

    return (
        <Pressable
            onPress={onPress}
            disabled={inativo}
            accessibilityRole="button"
            accessibilityState={{ disabled: inativo, busy: loading }}
            style={({ pressed }) => [
                styles.base,
                tamanho === 'sm' && styles.sm,
                tamanho === 'lg' && styles.lg,
                { backgroundColor: cores.fundo },
                variante === 'primario' && !inativo && (tamanho === 'lg' ? Shadow.lg : Shadow.sm),
                pressed && !inativo && styles.pressionado,
                pressed && variante === 'primario' && { backgroundColor: Colors.primaryContainer },
                inativo && styles.inativo,
                style,
            ]}
        >
            {loading ? (
                <ActivityIndicator size="small" color={cores.texto} />
            ) : icone ? (
                <Icon name={icone} size={tamIcone} color={cores.texto} />
            ) : null}
            <Text style={[tipografia, styles.texto, { color: cores.texto }, textStyle]} numberOfLines={tamanho === 'sm' ? 1 : 2}>
                {title}
            </Text>
            {iconeDireita && !loading ? <Icon name={iconeDireita} size={tamIcone} color={cores.texto} /> : null}
        </Pressable>
    );
}

/** Botão só com ícone (ex.: fechar modal). */
export function IconButton({ icone, onPress, label, cor = Colors.onSurface, fundo = Colors.surfaceContainer }: {
    icone: IconName;
    onPress: () => void;
    label: string;
    cor?: string;
    fundo?: string;
}) {
    return (
        <Pressable
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel={label}
            style={({ pressed }) => [styles.iconBtn, { backgroundColor: fundo }, pressed && styles.pressionado]}
        >
            <View>
                <Icon name={icone} size={20} color={cor} />
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    base: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: Radius.xl,
    },
    sm: { paddingVertical: 8, paddingHorizontal: 14 },
    lg: { paddingVertical: 16, paddingHorizontal: 24, borderRadius: Radius.xxl },
    texto: { flexShrink: 1, textAlign: 'center' },
    pressionado: { transform: [{ scale: 0.985 }] },
    inativo: { opacity: 0.5 },
    iconBtn: {
        width: 36,
        height: 36,
        borderRadius: Radius.full,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
