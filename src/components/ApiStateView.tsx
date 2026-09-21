import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';

type ApiStateViewProps = {
  error?: string | null;
  loading?: boolean;
  onRetry?: () => void;
};

export function ApiStateView({ error, loading = false, onRetry }: ApiStateViewProps) {
  return (
    <View style={styles.container}>
      {loading ? <ActivityIndicator color={colors.primary} size="large" /> : null}
      <Text style={styles.title}>{loading ? 'Carregando...' : 'Não foi possível carregar'}</Text>
      {error ? <Text style={styles.message}>{error}</Text> : null}
      {!loading && onRetry ? (
        <Pressable accessibilityRole="button" onPress={onRetry} style={styles.retryButton}>
          <Text style={styles.retryText}>Tentar novamente</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 28,
  },
  message: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 7,
    textAlign: 'center',
  },
  retryButton: {
    borderColor: colors.primary,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 18,
    paddingHorizontal: 18,
    paddingVertical: 11,
  },
  retryText: {
    color: colors.primaryDark,
    fontSize: 13,
    fontWeight: '800',
  },
  title: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '900',
    marginTop: 13,
  },
});
