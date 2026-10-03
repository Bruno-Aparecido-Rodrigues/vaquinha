import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import Icon, { IconName } from './icon';
import Button from './button';
import { Colors } from '@/constants/colors';
import { Radius, Spacing, Type } from '@/constants/theme';

export function LoadingView({ texto = 'Carregando...' }: { texto?: string }) {
    return (
        <View style={styles.box}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.descricao}>{texto}</Text>
        </View>
    );
}

export function ErrorView({ mensagem, onRetry }: { mensagem: string; onRetry?: () => void }) {
    return (
        <View style={styles.box}>
            <View style={[styles.circulo, { backgroundColor: Colors.errorContainer }]}>
                <Icon name="cloud-off" size={28} color={Colors.onErrorContainer} />
            </View>
            <Text style={styles.titulo}>Não foi possível carregar</Text>
            <Text style={styles.descricao}>{mensagem}</Text>
            {onRetry ? <Button title="Tentar novamente" icone="refresh" variante="tonal" onPress={onRetry} /> : null}
        </View>
    );
}

export function EmptyView({ icone = 'inbox', titulo, descricao, acao }: {
    icone?: IconName;
    titulo: string;
    descricao?: string;
    acao?: React.ReactNode;
}) {
    return (
        <View style={styles.box}>
            <View style={styles.circulo}>
                <Icon name={icone} size={28} color={Colors.primary} />
            </View>
            <Text style={styles.titulo}>{titulo}</Text>
            {descricao ? <Text style={styles.descricao}>{descricao}</Text> : null}
            {acao}
        </View>
    );
}

const styles = StyleSheet.create({
    box: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 64,
        paddingHorizontal: Spacing.lg,
        gap: Spacing.md,
    },
    circulo: {
        width: 64,
        height: 64,
        borderRadius: Radius.full,
        backgroundColor: Colors.primaryFixed,
        alignItems: 'center',
        justifyContent: 'center',
    },
    titulo: { ...Type.headlineSm, color: Colors.onSurface, textAlign: 'center' },
    descricao: { ...Type.bodyMd, color: Colors.onSurfaceVariant, textAlign: 'center', maxWidth: 480 },
});
