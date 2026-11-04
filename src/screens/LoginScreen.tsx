import { useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';

import { AuthButton } from '../components/AuthButton';
import { AuthLink } from '../components/AuthLink';
import { AuthTextInput } from '../components/AuthTextInput';
import { useSnackbar } from '../components/Snackbar';
import { getApiErrorMessage } from '../services/apiClient';
import { colors } from '../theme/colors';
import { LoginRequest } from '../types/api';
import { validateEmail, validatePassword } from '../utils/validation';

type LoginScreenProps = {
  onCreateAccount: () => void;
  onLogin: (payload: LoginRequest) => Promise<void>;
};

export function LoginScreen({ onCreateAccount, onLogin }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showError } = useSnackbar();

  const [touched, setTouched] = useState({ email: false, password: false });
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const emailError = validateEmail(email);
  const passwordError = validatePassword(password);

  async function handleLogin() {
    if (isSubmitting) return;
    setSubmitAttempted(true);
    if (emailError || passwordError) return;
    setIsSubmitting(true);
    try {
      await onLogin({ email: email.trim(), senha: password });
    } catch (requestError) {
      showError(getApiErrorMessage(requestError));
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
            Entre com o e-mail e a senha usados no cadastro.
          </Text>

          <AuthTextInput
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            label="E-mail"
            autoCorrect={false}
            editable={!isSubmitting}
            error={submitAttempted || touched.email ? emailError : null}
            onBlur={() => setTouched((current) => ({ ...current, email: true }))}
            onChangeText={setEmail}
            value={email}
          />
          <AuthTextInput
            autoComplete="password"
            label="Senha"
            secureTextEntry
            autoCapitalize="none"
            editable={!isSubmitting}
            error={submitAttempted || touched.password ? passwordError : null}
            onBlur={() => setTouched((current) => ({ ...current, password: true }))}
            onChangeText={setPassword}
            value={password}
          />

        </View>

        <View style={styles.footer}>
          <AuthButton
            disabled={isSubmitting}
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
