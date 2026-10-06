import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Logo } from './logo';
import { Colors } from '@/constants/colors';
import { MAX_WIDTH, Spacing, Type } from '@/constants/theme';

export default function AppFooter() {
    return (
        <View style={styles.footer}>
            <View style={styles.inner}>
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: Spacing.md,
    },
    texto: { ...Type.bodySm, color: Colors.onSurfaceVariant, textAlign: 'center' },
});
