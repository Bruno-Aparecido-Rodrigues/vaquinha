import React from 'react';
import { RefreshControl, ScrollView, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import AppHeader, { Aba } from './app-header';
import AppFooter from './app-footer';
import { Colors } from '@/constants/colors';
import { MAX_WIDTH, Spacing } from '@/constants/theme';

type Props = {
    children: React.ReactNode;
    ativo?: Aba;
    admin?: boolean;
    refreshing?: boolean;
    onRefresh?: () => void;
};

/** Estrutura padrão das telas logadas: cabeçalho fixo + conteúdo rolável + rodapé. */
export default function Screen({ children, ativo, admin, refreshing, onRefresh }: Props) {
    return (
        <View style={styles.tela}>
            <AppHeader ativo={ativo} admin={admin} />
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.conteudo}
                refreshControl={onRefresh ? <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} /> : undefined}
            >
                <View style={styles.corpo}>{children}</View>
                <AppFooter />
            </ScrollView>
        </View>
    );
}

/** Centraliza o conteúdo com largura máxima (max-w-[1240px] mx-auto px-gutter). */
export function Container({ children, maxWidth = MAX_WIDTH, style }: {
    children: React.ReactNode;
    maxWidth?: number;
    style?: StyleProp<ViewStyle>;
}) {
    return (
        <View style={[styles.container, { maxWidth, paddingHorizontal: Spacing.gutter }, style]}>
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    tela: { flex: 1, backgroundColor: Colors.surface },
    scroll: { flex: 1 },
    conteudo: { flexGrow: 1 },
    corpo: { flex: 1 },
    container: { width: '100%', alignSelf: 'center' },
});
