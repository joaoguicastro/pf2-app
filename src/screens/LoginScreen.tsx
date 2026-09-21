import { useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';

import { AuthButton } from '../components/AuthButton';
import { AuthLink } from '../components/AuthLink';
import { AuthTextInput } from '../components/AuthTextInput';
import { getApiErrorMessage } from '../services/apiClient';
import { colors } from '../theme/colors';
import { LoginRequest } from '../types/api';

type LoginScreenProps = {
  onCreateAccount: () => void;
  onLogin: (payload: LoginRequest) => Promise<void>;
};

export function LoginScreen({ onCreateAccount, onLogin }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = email.trim().length > 0 && password.length > 0;

  async function handleLogin() {
    if (!canSubmit || isSubmitting) return;
    setError(null);
    setIsSubmitting(true);
    try {
      await onLogin({ email: email.trim(), senha: password });
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>

      <View style={styles.content}>
        <View>
          <Text style={styles.brand}>Med+Facil</Text>
          <Text style={styles.heading}>Entrar na sua conta</Text>
          <Text style={styles.description}>
            A entrada é demonstrativa por enquanto. Para enviar uma triagem, crie um cadastro.
          </Text>

          <AuthTextInput
            autoCapitalize="none"
            keyboardType="email-address"
            label="E-mail"
            onChangeText={setEmail}
            value={email}
          />

          <AuthTextInput
            label="Senha"
            onChangeText={setPassword}
            secureTextEntry
            value={password}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

        </View>

        <View style={styles.footer}>
          <AuthButton
            disabled={!canSubmit || isSubmitting}
            label={isSubmitting ? 'Entrando...' : 'Entrar'}
            onPress={handleLogin}
          />
          <AuthLink label="Não tenho conta — Criar agora" onPress={onCreateAccount} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingBottom: 28,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  description: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 24,
  },
  footer: {
    gap: 16,
  },
  error: {
    backgroundColor: colors.dangerLight,
    borderRadius: 8,
    color: colors.danger,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 8,
    padding: 12,
  },
  brand: {
    color: colors.primaryDark,
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 18,
  },
  heading: {
    color: colors.text,
    fontSize: 21,
    fontWeight: '900',
    marginBottom: 6,
  },
  safeArea: {
    backgroundColor: colors.background,
    flex: 1,
  },
});
