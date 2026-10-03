import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Logo } from './logo';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { Colors } from '@/constants/colors';
import { MAX_WIDTH, Spacing, Type } from '@/constants/theme';

export default function AppFooter() {
    const { isMd } = useBreakpoint();
    return (
        <View style={styles.footer}>
            <View style={[styles.inner, isMd && styles.innerRow]}>
                <Logo size={24} />
                <Text style={styles.texto}>© 2026 Muuv Vaquinhas Online. Feito com afeto e cooperação.</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    footer: {
        backgroundColor: Colors.surfaceContainerLow,
        marginTop: Spacing.xl,
        paddingVertical: Spacing.lg,
    },
    inner: {
        width: '100%',
        maxWidth: MAX_WIDTH,
        alignSelf: 'center',
        paddingHorizontal: Spacing.gutter,
        alignItems: 'center',
        gap: Spacing.md,
    },
    innerRow: { flexDirection: 'row', justifyContent: 'space-between' },
    texto: { ...Type.bodySm, color: Colors.onSurfaceVariant, textAlign: 'center' },
});
