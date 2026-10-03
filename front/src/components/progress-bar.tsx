import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { Radius } from '@/constants/theme';

type Props = {
    percentual: number;
    altura?: number;
    cor?: string;
    inset?: boolean;
};

export default function ProgressBar({ percentual, altura = 8, cor = Colors.primary, inset = false }: Props) {
    const largura = Math.max(0, Math.min(100, percentual));
    return (
        <View
            accessibilityRole="progressbar"
            accessibilityValue={{ min: 0, max: 100, now: largura }}
            style={[styles.trilho, { height: altura }, inset && styles.inset]}
        >
            <View style={[styles.barra, { width: `${largura}%` as const, backgroundColor: cor }]} />
        </View>
    );
}

const styles = StyleSheet.create({
    trilho: {
        width: '100%',
        backgroundColor: Colors.surfaceContainer,
        borderRadius: Radius.full,
        overflow: 'hidden',
    },
    inset: { padding: 2, boxShadow: 'inset 0px 1px 2px rgba(28, 27, 26, 0.08)' },
    barra: { height: '100%', borderRadius: Radius.full },
});
