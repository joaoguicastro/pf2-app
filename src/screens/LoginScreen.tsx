import { useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';

import { AuthButton } from '../components/AuthButton';
import { AuthLink } from '../components/AuthLink';
import { AuthTextInput } from '../components/AuthTextInput';
import { colors } from '../theme/colors';

type LoginScreenProps = {
  onCreateAccount: () => void;
  onLogin: () => void;
};

export function LoginScreen({ onCreateAccount, onLogin }: LoginScreenProps) {
  const [email, setEmail] = useState('maria@exemplo.com');
  const [password, setPassword] = useState('12345678');

  const canSubmit = email.trim().length > 0 && password.length > 0;

  return (
    <SafeAreaView style={styles.safeArea}>

      <View style={styles.content}>
        <View>
          <Text style={styles.brand}>Med+Facil</Text>
          <Text style={styles.heading}>Entrar na sua conta</Text>
          {/* <Text style={styles.description}>
            O login é opcional. Ele serve para guardar o histórico das suas avaliações.
          </Text> */}

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

          <AuthLink label="Esqueci minha senha" onPress={() => undefined} />
        </View>

        <View style={styles.footer}>
          <AuthButton label="Entrar" onPress={canSubmit ? onLogin : () => undefined} />
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
