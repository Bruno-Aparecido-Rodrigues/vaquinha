import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { Colors } from '@/constants/colors';
import { Type } from '@/constants/theme';

/** Selo verde com a carinha da vaca (desenho do mockup de login). */
export function LogoBadge({ size = 44 }: { size?: number }) {
    return (
        <View style={[styles.badge, { width: size, height: size, borderRadius: size * 0.36 }]}>
            <Svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24" fill="none"
                 stroke={Colors.onPrimary} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                <Path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
                <Path d="M7 10c1 0 2.5 1.5 2.5 3s-1.5 3-2.5 3" />
                <Path d="M17 10c-1 0-2.5 1.5-2.5 3s1.5 3 2.5 3" />
                <Circle cx="12" cy="16" r="1.5" fill={Colors.onPrimary} />
            </Svg>
        </View>
    );
}

/** Logo + nome usado no cabeçalho e no rodapé. */
export function Logo({ subtitulo, size = 32 }: { subtitulo?: string; size?: number }) {
    return (
        <View style={styles.row}>
            <LogoBadge size={size} />
            <Text style={styles.nome}>
                Muuv{subtitulo ? <Text style={styles.sub}> {subtitulo}</Text> : null}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    badge: {
        backgroundColor: Colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0px 4px 10px rgba(47, 103, 54, 0.2)',
    },
    row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    nome: { ...Type.headlineSm, color: Colors.primary, letterSpacing: -0.4 },
    sub: { ...Type.bodySm, color: Colors.onSurfaceVariant },
});
