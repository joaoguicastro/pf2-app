import { ReactNode, useEffect, useRef } from 'react';
import { AccessibilityInfo, Animated, DimensionValue, Easing, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { colors } from '../theme/colors';

type SkeletonProps = {
  height?: DimensionValue;
  radius?: number;
  style?: StyleProp<ViewStyle>;
  width?: DimensionValue;
};

// Bloco cinza estático; a animação fica no SkeletonGroup para todos pulsarem juntos
export function Skeleton({ height = 14, radius = 6, style, width = '100%' }: SkeletonProps) {
  return <View style={[styles.block, { borderRadius: radius, height, width }, style]} />;
}

type SkeletonGroupProps = {
  accessibilityLabel?: string;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function SkeletonGroup({ accessibilityLabel = 'Carregando', children, style }: SkeletonGroupProps) {
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let animation: Animated.CompositeAnimation | null = null;
    let active = true;
    void AccessibilityInfo.isReduceMotionEnabled().catch(() => false).then((reduceMotion) => {
      if (!active || reduceMotion) return;
      animation = Animated.loop(
        Animated.sequence([
          Animated.timing(opacity, { duration: 700, easing: Easing.inOut(Easing.ease), toValue: 0.45, useNativeDriver: true }),
          Animated.timing(opacity, { duration: 700, easing: Easing.inOut(Easing.ease), toValue: 1, useNativeDriver: true }),
        ]),
      );
      animation.start();
    });
    return () => { active = false; animation?.stop(); };
  }, [opacity]);

  return (
    <Animated.View
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="progressbar"
      accessibilityState={{ busy: true }}
      style={[{ opacity }, style]}
    >
      {children}
    </Animated.View>
  );
}

export function SkeletonCard({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  block: {
    backgroundColor: '#D6E6F0',
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
    padding: 16,
  },
});
