import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Button from './button';
import Icon, { IconName } from './icon';
import { Colors } from '@/constants/colors';
import { Radius, Shadow, Spacing, Type } from '@/constants/theme';

type Props = {
    visible: boolean;
    titulo: string;
    mensagem: string;
    textoConfirmar: string;
    icone?: IconName;
    perigo?: boolean;
    loading?: boolean;
    onConfirmar: () => void;
    onCancelar: () => void;
};

/**
 * Substitui o confirm() dos mockups. (No React Native Web o Alert.alert não mostra nada,
 * por isso a confirmação é um modal próprio.)
 */
export default function ConfirmDialog({
    visible, titulo, mensagem, textoConfirmar, icone = 'help-outline', perigo = false, loading = false, onConfirmar, onCancelar,
}: Props) {
    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancelar}>
            <View style={styles.overlay}>
                <Pressable style={StyleSheet.absoluteFill} onPress={loading ? undefined : onCancelar} />
                <View style={styles.card}>
                    <View style={[styles.icone, perigo && { backgroundColor: Colors.errorContainer }]}>
                        <Icon name={icone} size={26} color={perigo ? Colors.onErrorContainer : Colors.primary} />
                    </View>
                    <Text style={styles.titulo}>{titulo}</Text>
                    <Text style={styles.mensagem}>{mensagem}</Text>
                    <View style={styles.botoes}>
                        <Button title="Cancelar" variante="tonal" onPress={onCancelar} disabled={loading} style={styles.botao} />
                        <Button
                            title={textoConfirmar}
                            variante={perigo ? 'perigo' : 'primario'}
                            onPress={onConfirmar}
                            loading={loading}
                            style={styles.botao}
                        />
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(49, 48, 46, 0.6)',
        alignItems: 'center',
        justifyContent: 'center',
        padding: Spacing.md,
    },
    card: {
        width: '100%',
        maxWidth: 440,
        backgroundColor: Colors.surface,
        borderRadius: Radius.xxl,
        padding: Spacing.lg,
        gap: Spacing.sm,
        ...Shadow.xl,
    },
    icone: {
        width: 48,
        height: 48,
        borderRadius: Radius.full,
        backgroundColor: Colors.primaryFixed,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.xs,
    },
    titulo: { ...Type.headlineSm, color: Colors.onSurface },
    mensagem: { ...Type.bodyMd, color: Colors.onSurfaceVariant },
    botoes: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.md, flexWrap: 'wrap' },
    botao: { flexGrow: 1 },
});
