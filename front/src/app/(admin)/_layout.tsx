import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Redirect, Stack } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { Colors } from '@/constants/colors';

/**
 * Área exclusiva do ADMIN. Esconder a tela no front é só conforto:
 * quem realmente bloqueia é o gateway (rota /relatorio/** exige ROLE_ADMIN).
 */
export default function AdminLayout() {
    const { isAuthenticated, isAdmin, isLoading } = useAuth();

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.surface }}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    if (!isAuthenticated) return <Redirect href="/" />;
    if (!isAdmin) return <Redirect href="/explorar" />;

    return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Colors.surface } }} />;
}
