import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Logo } from './logo';
import Icon from './icon';
import { useAuth } from '@/context/AuthContext';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { Colors } from '@/constants/colors';
import { MAX_WIDTH, Radius, Spacing, Type } from '@/constants/theme';

export type Aba = 'explorar' | 'minhas-vaquinhas' | 'painel';

const ABAS_CLIENTE: { id: Aba; label: string; rota: '/explorar' | '/minhas-vaquinhas' }[] = [
    { id: 'explorar', label: 'Explorar', rota: '/explorar' },
    { id: 'minhas-vaquinhas', label: 'Minhas Vaquinhas', rota: '/minhas-vaquinhas' },
];

type Props = {
    ativo?: Aba;
    admin?: boolean;
};

export default function AppHeader({ ativo, admin = false }: Props) {
    const { usuario, signOut } = useAuth();
    const { isMd } = useBreakpoint();

    async function sair() {
        await signOut();
        router.replace('/');
    }

    const nav = admin ? (
        <View style={styles.adminPill}>
            <Icon name="admin-panel-settings" size={16} color={Colors.onPrimaryFixed} />
            <Text style={styles.adminPillText}>Painel Administrativo</Text>
        </View>
    ) : (
        <View style={styles.nav}>
            {ABAS_CLIENTE.map(aba => {
                const selecionada = aba.id === ativo;
                return (
                    <Pressable
                        key={aba.id}
                        onPress={() => router.push(aba.rota)}
                        style={({ pressed }) => [styles.navItem, selecionada && styles.navItemAtivo, pressed && styles.navItemPress]}
                        accessibilityRole="link"
                        accessibilityState={{ selected: selecionada }}
                    >
                        <Text style={[styles.navText, selecionada && styles.navTextAtivo]}>{aba.label}</Text>
                    </Pressable>
                );
            })}
        </View>
    );

    return (
        <View style={styles.header}>
            <View style={[styles.inner, !isMd && styles.innerMobile]}>
                <View style={styles.esquerda}>
                    <Pressable onPress={() => router.push(admin ? '/painel' : '/explorar')} accessibilityRole="link">
                        <Logo subtitulo={isMd ? (admin ? 'Admin' : 'Vaquinhas') : undefined} />
                    </Pressable>
                    {isMd ? nav : null}
                </View>
                <View style={styles.direita}>
                    {isMd && usuario ? <Text style={styles.nome} numberOfLines={1}>{usuario.nome}</Text> : null}
                    <Pressable
                        onPress={sair}
                        style={({ pressed }) => [styles.sair, pressed && styles.navItemPress]}
                        accessibilityRole="button"
                    >
                        <Icon name="logout" size={18} color={Colors.onSurfaceVariant} />
                        <Text style={styles.sairText}>Sair</Text>
                    </Pressable>
                </View>
            </View>
            {!isMd ? <View style={styles.navMobile}>{nav}</View> : null}
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        backgroundColor: 'rgba(253, 249, 245, 0.95)',
        boxShadow: '0px 1px 8px rgba(0, 0, 0, 0.04)',
        zIndex: 50,
    },
    inner: {
        height: 80,
        width: '100%',
        maxWidth: MAX_WIDTH,
        alignSelf: 'center',
        paddingHorizontal: Spacing.gutter,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: Spacing.lg,
    },
    innerMobile: { height: 64, paddingHorizontal: Spacing.gutterMobile },
    esquerda: { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg, flexShrink: 1 },
    direita: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, flexShrink: 0 },
    nav: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
    navMobile: { paddingHorizontal: Spacing.gutterMobile, paddingBottom: Spacing.sm },
    navItem: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: Radius.xl },
    navItemAtivo: { backgroundColor: Colors.surfaceContainerHigh },
    navItemPress: { backgroundColor: Colors.surfaceContainer },
    navText: { ...Type.labelLg, color: Colors.onSurfaceVariant },
    navTextAtivo: { color: Colors.onSurface },
    nome: { ...Type.labelLg, color: Colors.onSurface, maxWidth: 220 },
    sair: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: Radius.lg,
    },
    sairText: { ...Type.labelMd, color: Colors.onSurfaceVariant },
    adminPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: Colors.primaryFixed,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: Radius.full,
        alignSelf: 'flex-start',
    },
    adminPillText: { ...Type.labelMd, color: Colors.onPrimaryFixed },
});
