import React from 'react';
import { StyleProp, TextStyle } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

// Os mockups usavam "Material Symbols"; aqui usamos o equivalente do @expo/vector-icons
export type IconName = React.ComponentProps<typeof MaterialIcons>['name'];

type Props = {
    name: IconName;
    size?: number;
    color?: string;
    style?: StyleProp<TextStyle>;
};

export default function Icon({ name, size = 20, color, style }: Props) {
    return <MaterialIcons name={name} size={size} color={color} style={style} />;
}
