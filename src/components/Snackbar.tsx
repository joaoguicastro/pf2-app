import { ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';

type SnackbarType = 'success' | 'error';

type SnackbarMessage = { id: number; message: string; type: SnackbarType };

type SnackbarContextValue = {
  showError: (message: string) => void;
  showSuccess: (message: string) => void;
};

const DURATION_MS: Record<SnackbarType, number> = { error: 5000, success: 3000 };

const SnackbarContext = createContext<SnackbarContextValue | null>(null);

export function useSnackbar() {
  const context = useContext(SnackbarContext);
  if (!context) throw new Error('useSnackbar precisa estar dentro de SnackbarProvider.');
  return context;
}

export function SnackbarProvider({ children }: { children: ReactNode }) {
  const [current, setCurrent] = useState<SnackbarMessage | null>(null);
  const nextId = useRef(0);
  const progress = useRef(new Animated.Value(0)).current;
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const hide = useCallback(() => {
    clearTimeout(timer.current);
    Animated.timing(progress, { duration: 180, easing: Easing.in(Easing.ease), toValue: 0, useNativeDriver: true })
      .start(({ finished }) => { if (finished) setCurrent(null); });
  }, [progress]);

  const show = useCallback((type: SnackbarType, message: string) => {
    clearTimeout(timer.current);
    // Uma mensagem por vez: a nova substitui a anterior
    setCurrent({ id: ++nextId.current, message, type });
  }, []);

  useEffect(() => {
    if (!current) return;
    progress.setValue(0);
    Animated.timing(progress, { duration: 220, easing: Easing.out(Easing.ease), toValue: 1, useNativeDriver: true }).start();
    AccessibilityInfo.announceForAccessibility(current.message);
    timer.current = setTimeout(hide, DURATION_MS[current.type]);
    return () => clearTimeout(timer.current);
  }, [current, hide, progress]);

  const value = useMemo<SnackbarContextValue>(() => ({
    showError: (message) => show('error', message),
    showSuccess: (message) => show('success', message),
  }), [show]);

  const translateY = progress.interpolate({ inputRange: [0, 1], outputRange: [40, 0] });
  const isError = current?.type === 'error';

  return (
    <SnackbarContext.Provider value={value}>
      <View style={styles.root}>
        {children}
        {current ? (
          <Animated.View
            accessibilityLiveRegion={isError ? 'assertive' : 'polite'}
            pointerEvents="box-none"
            style={[styles.container, { opacity: progress, transform: [{ translateY }] }]}
          >
            <Pressable
              accessibilityHint="Toque para fechar"
              accessibilityRole={isError ? 'alert' : 'text'}
              onPress={hide}
              style={[styles.snackbar, isError ? styles.error : styles.success]}
            >
              <View style={styles.icon}>
                <Text style={styles.iconText}>{isError ? '!' : '✓'}</Text>
              </View>
              <Text style={styles.message}>{current.message}</Text>
              <Text style={styles.close}>✕</Text>
            </Pressable>
          </Animated.View>
        ) : null}
      </View>
    </SnackbarContext.Provider>
  );
}

const styles = StyleSheet.create({
  close: { color: colors.white, fontSize: 13, opacity: 0.8, paddingLeft: 4 },
  container: {
    bottom: Platform.select({ ios: 40, default: 24 }),
    left: 16,
    position: 'absolute',
    right: 16,
  },
  error: { backgroundColor: colors.danger },
  icon: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: 11,
    height: 22,
    justifyContent: 'center',
    width: 22,
  },
  iconText: { color: colors.white, fontSize: 13, fontWeight: '900' },
  message: { color: colors.white, flex: 1, fontSize: 14, fontWeight: '700', lineHeight: 19 },
  root: { flex: 1 },
  snackbar: {
    alignItems: 'center',
    borderRadius: 12,
    elevation: 6,
    flexDirection: 'row',
    gap: 12,
    minHeight: 52,
    paddingHorizontal: 14,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { height: 4, width: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
  },
  success: { backgroundColor: colors.success },
});
