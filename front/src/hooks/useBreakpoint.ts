import { useWindowDimensions } from 'react-native';

/** Equivalente aos prefixos md: / lg: / xl: do Tailwind. */
export function useBreakpoint() {
    const { width } = useWindowDimensions();
    return {
        width,
        isSm: width >= 640,
        isMd: width >= 768,
        isLg: width >= 1024,
        isXl: width >= 1280,
    };
}
