import React, { forwardRef, useState } from 'react';
import { StyleProp, StyleSheet, Text, TextInput, TextInputProps, View, ViewStyle } from 'react-native';
import Icon, { IconName } from './icon';
import { Colors } from '@/constants/colors';
import { Fonts, Radius, Shadow, Type } from '@/constants/theme';

type Props = TextInputProps & {
    label?: string;
    labelDireita?: string;
    icone?: IconName;
    prefixo?: string;
    direita?: React.ReactNode;
    erro?: boolean;
    containerStyle?: StyleProp<ViewStyle>;
    grande?: boolean;
};

/** Campo de texto no estilo dos mockups (fundo surface-container-low, cantos arredondados). */
const TextField = forwardRef<TextInput, Props>(function TextField(
    { label, labelDireita, icone, prefixo, direita, erro, containerStyle, grande, style, multiline, onFocus, onBlur, ...rest },
    ref
) {
    const [focado, setFocado] = useState(false);

    return (
        <View style={[styles.container, containerStyle]}>
            {label ? (
                <View style={styles.labelRow}>
                    <Text style={styles.label}>{label}</Text>
                    {labelDireita ? <Text style={styles.labelDireita}>{labelDireita}</Text> : null}
                </View>
            ) : null}
            <View
                style={[
                    styles.inputBox,
                    focado && styles.inputBoxFocado,
                    erro && styles.inputBoxErro,
                    multiline && styles.inputBoxMulti,
                ]}
            >
                {icone ? <Icon name={icone} size={20} color={Colors.outline} style={styles.icone} /> : null}
                {prefixo ? <Text style={[styles.prefixo, grande && Type.headlineSm]}>{prefixo}</Text> : null}
                <TextInput
                    ref={ref}
                    placeholderTextColor={Colors.outline}
                    multiline={multiline}
                    onFocus={(e) => { setFocado(true); onFocus?.(e); }}
                    onBlur={(e) => { setFocado(false); onBlur?.(e); }}
                    style={[
                        styles.input,
                        grande && styles.inputGrande,
                        erro && { color: Colors.error },
                        multiline && styles.inputMulti,
                        style,
                    ]}
                    {...rest}
                />
                {direita}
            </View>
        </View>
    );
});

export default TextField;

const styles = StyleSheet.create({
    container: { gap: 6 },
    labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
    label: { ...Type.labelMd, color: Colors.onSurface },
    labelDireita: { ...Type.bodySm, fontSize: 13, color: Colors.onSurfaceVariant },
    inputBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surfaceContainerLow,
        borderRadius: Radius.xl,
        borderWidth: 2,
        borderColor: Colors.transparent,
        paddingHorizontal: 14,
        ...Shadow.sm,
    },
    inputBoxFocado: { backgroundColor: Colors.surfaceContainerLowest, borderColor: 'rgba(47, 103, 54, 0.3)' },
    inputBoxErro: { borderColor: 'rgba(186, 26, 26, 0.35)' },
    inputBoxMulti: { alignItems: 'flex-start', paddingVertical: 4 },
    icone: { marginRight: 10 },
    prefixo: { ...Type.labelLg, fontFamily: Fonts.bold, color: Colors.onSurfaceVariant, marginRight: 8 },
    input: {
        flex: 1,
        minWidth: 0,
        paddingVertical: 12,
        color: Colors.onSurface,
        ...Type.bodyMd,
        outlineWidth: 0,
    },
    inputGrande: { ...Type.headlineSm, fontFamily: Fonts.bold },
    inputMulti: { minHeight: 132, textAlignVertical: 'top', lineHeight: 26 },
});
