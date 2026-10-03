import { TextStyle } from 'react-native';

// Espaçamentos (space-xs ... space-xl e gutter dos mockups)
export const Spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 40,
    gutter: 24,
    gutterMobile: 16,
};

export const Radius = {
    sm: 4,
    lg: 8,
    xl: 12,
    xxl: 16,
    xxxl: 24,
    full: 9999,
};

// Plus Jakarta Sans: no React Native cada peso é um arquivo de fonte diferente
export const Fonts = {
    regular: 'PlusJakartaSans_400Regular',
    medium: 'PlusJakartaSans_500Medium',
    semibold: 'PlusJakartaSans_600SemiBold',
    bold: 'PlusJakartaSans_700Bold',
    extrabold: 'PlusJakartaSans_800ExtraBold',
};

// Escala tipográfica (font-display, font-headline-*, font-body-*, font-label-*)
export const Type = {
    display: { fontFamily: Fonts.extrabold, fontSize: 48, lineHeight: 56, letterSpacing: -1.4 },
    displayMobile: { fontFamily: Fonts.extrabold, fontSize: 34, lineHeight: 42, letterSpacing: -0.9 },
    headlineLg: { fontFamily: Fonts.bold, fontSize: 32, lineHeight: 40, letterSpacing: -0.6 },
    headlineMd: { fontFamily: Fonts.bold, fontSize: 24, lineHeight: 32, letterSpacing: -0.36 },
    headlineSm: { fontFamily: Fonts.semibold, fontSize: 20, lineHeight: 28, letterSpacing: -0.2 },
    financialStat: { fontFamily: Fonts.extrabold, fontSize: 30, lineHeight: 36, letterSpacing: -0.6 },
    bodyLg: { fontFamily: Fonts.regular, fontSize: 18, lineHeight: 28 },
    bodyMd: { fontFamily: Fonts.regular, fontSize: 16, lineHeight: 24 },
    bodySm: { fontFamily: Fonts.regular, fontSize: 14, lineHeight: 20 },
    labelLg: { fontFamily: Fonts.semibold, fontSize: 15, lineHeight: 20, letterSpacing: 0.15 },
    labelMd: { fontFamily: Fonts.semibold, fontSize: 13, lineHeight: 18, letterSpacing: 0.13 },
    labelSm: { fontFamily: Fonts.bold, fontSize: 11, lineHeight: 16, letterSpacing: 0.22 },
} satisfies Record<string, TextStyle>;

// Sombras (boxShadow funciona no web e na nova arquitetura do React Native)
export const Shadow = {
    sm: { boxShadow: '0px 1px 3px rgba(28, 27, 26, 0.08)' },
    md: { boxShadow: '0px 4px 12px rgba(28, 27, 26, 0.08)' },
    lg: { boxShadow: '0px 10px 24px rgba(28, 27, 26, 0.12)' },
    xl: { boxShadow: '0px 20px 40px rgba(28, 27, 26, 0.16)' },
};

export const MAX_WIDTH = 1240;
