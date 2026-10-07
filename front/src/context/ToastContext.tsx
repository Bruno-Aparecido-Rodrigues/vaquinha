import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import Icon, { IconName } from '@/components/icon';
import { Colors } from '@/constants/colors';
import { Radius, Shadow, Spacing, Type } from '@/constants/theme';

type Tipo = 'sucesso' | 'erro' | 'info';

type Toast = {
    titulo: string;
    descricao?: string;
    tipo?: Tipo;
    icone?: IconName;
};

type ToastContextData = {
    showToast: (toast: Toast) => void;
};

const ToastContext = createContext<ToastContextData>({ showToast: () => {} });

const ICONES: Record<Tipo, IconName> = {
    sucesso: 'check-circle',
    erro: 'error',
    info: 'info',
};

/** Aviso flutuante no rodapé. */
export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
    const [toast, setToast] = useState<Toast | null>(null);
    const anim = useRef(new Animated.Value(0)).current;
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const esconder = useCallback(() => {
        Animated.timing(anim, { toValue: 0, duration: 250, useNativeDriver: false }).start(() => setToast(null));
    }, [anim]);

    const showToast = useCallback((t: Toast) => {
        if (timer.current) clearTimeout(timer.current);
        setToast(t);
        Animated.timing(anim, { toValue: 1, duration: 250, useNativeDriver: false }).start();
        timer.current = setTimeout(esconder, 3800);
    }, [anim, esconder]);

    useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

    const tipo = toast?.tipo ?? 'sucesso';
    const corIcone = tipo === 'erro' ? Colors.secondaryContainer : Colors.primaryFixed;

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {toast && (
                <View pointerEvents="none" style={styles.wrapper}>
                    <Animated.View
                        style={[
                            styles.toast,
                            {
                                opacity: anim,
                                transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [80, 0] }) }],
                            },
                        ]}
                    >
                        <Icon name={toast.icone ?? ICONES[tipo]} size={24} color={corIcone} />
                        <View style={styles.textos}>
                            <Text style={styles.titulo}>{toast.titulo}</Text>
                            {toast.descricao ? <Text style={styles.descricao}>{toast.descricao}</Text> : null}
                        </View>
                    </Animated.View>
                </View>
            )}
        </ToastContext.Provider>
    );
};

export const useToast = () => useContext(ToastContext);

const styles = StyleSheet.create({
    wrapper: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: Spacing.lg,
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
        zIndex: 999,
    },
    toast: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: Colors.inverseSurface,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: Radius.xxl,
        maxWidth: 480,
        ...Shadow.xl,
    },
    textos: { flexShrink: 1 },
    titulo: { ...Type.labelMd, fontFamily: Type.labelSm.fontFamily, color: Colors.inverseOnSurface },
    descricao: { ...Type.bodySm, color: Colors.inverseOnSurface, opacity: 0.8 },
});
