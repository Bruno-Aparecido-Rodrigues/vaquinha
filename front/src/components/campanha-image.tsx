import React, { useState } from 'react';
import { Image, ImageStyle, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import Icon from './icon';
import { Colors } from '@/constants/colors';

type Props = {
    uri?: string;
    style?: StyleProp<ImageStyle>;
    cinza?: boolean;
};

/** Foto da vaquinha com um substituto caso o link da imagem esteja quebrado. */
export default function CampanhaImage({ uri, style, cinza }: Props) {
    const [falhou, setFalhou] = useState(false);

    if (!uri || falhou) {
        return (
            <View style={[styles.placeholder, StyleSheet.flatten(style) as ViewStyle]}>
                <Icon name="image" size={40} color={Colors.outlineVariant} />
            </View>
        );
    }

    return (
        <Image
            source={{ uri }}
            style={[styles.imagem, cinza && styles.cinza, style]}
            resizeMode="cover"
            onError={() => setFalhou(true)}
        />
    );
}

const styles = StyleSheet.create({
    imagem: { width: '100%', height: '100%', backgroundColor: Colors.surfaceContainer },
    cinza: { opacity: 0.85 },
    placeholder: {
        width: '100%',
        height: '100%',
        backgroundColor: Colors.surfaceContainer,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
