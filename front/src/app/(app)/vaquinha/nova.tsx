import React from 'react';
import Screen from '@/components/screen';
import CampanhaForm from '@/components/campanha-form';

export default function NovaVaquinha() {
    return (
        <Screen ativo="minhas-vaquinhas">
            <CampanhaForm />
        </Screen>
    );
}
