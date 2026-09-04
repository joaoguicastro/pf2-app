import { useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppHeader } from '../components/AppHeader';
import { AuthButton } from '../components/AuthButton';
import { AuthLink } from '../components/AuthLink';
import { AuthTextInput } from '../components/AuthTextInput';
import { colors } from '../theme/colors';

type CreateAccountScreenProps = {
  onBack: () => void;
  onCreateAccount: () => void;
  onLogin: () => void;
};

export function CreateAccountScreen({ onBack, onCreateAccount, onLogin }: CreateAccountScreenProps) {
  const [acceptedTerms, setAcceptedTerms] = useState(true);
  const [fullName, setFullName] = useState('Maria da Silva');
  const [age, setAge] = useState('34');
  const [gender, setGender] = useState('Feminino');
  const [email, setEmail] = useState('maria@exemplo.com');
  const [password, setPassword] = useState('12345678');
  const [confirmPassword, setConfirmPassword] = useState('12345678');

  const canSubmit =
    acceptedTerms &&
    fullName.trim().length > 0 &&
    age.trim().length > 0 &&
    gender.trim().length > 0 &&
    email.trim().length > 0 &&
    password.length >= 8 &&
    password === confirmPassword;

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader onBack={onBack} title="Criar conta" />

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.brand}>Med+Facil</Text>
        <Text style={styles.description}>
          Criar uma conta é opcional e serve para guardar o histórico das suas avaliações e agilizar
          seu atendimento.
        </Text>

        <AuthTextInput label="Nome completo" onChangeText={setFullName} value={fullName} />

        <View style={styles.row}>
          <View style={styles.rowItem}>
            <AuthTextInput
              keyboardType="number-pad"
              label="Idade"
              onChangeText={setAge}
              value={age}
            />
          </View>
          <View style={styles.rowItem}>
            <AuthTextInput label="Sexo" onChangeText={setGender} value={gender} />
          </View>
        </View>

        <AuthTextInput
          autoCapitalize="none"
          keyboardType="email-address"
          label="E-mail"
          onChangeText={setEmail}
          value={email}
        />

        <AuthTextInput
          helperText="Mínimo de 8 caracteres."
          label="Senha"
          onChangeText={setPassword}
          secureTextEntry
          value={password}
        />

        <AuthTextInput
          label="Confirmar senha"
          onChangeText={setConfirmPassword}
          secureTextEntry
          value={confirmPassword}
        />

        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: acceptedTerms }}
          onPress={() => setAcceptedTerms((current) => !current)}
          style={styles.termsRow}
        >
          <View style={[styles.checkbox, acceptedTerms && styles.checkboxChecked]}>
            {acceptedTerms ? <Text style={styles.checkmark}>✓</Text> : null}
          </View>
          <Text style={styles.termsText}>
            Li e aceito os <Text style={styles.termsLink}>Termos de Uso</Text> e a{' '}
            <Text style={styles.termsLink}>Política de Privacidade</Text>, incluindo o uso dos meus
            dados de saúde conforme a LGPD.
          </Text>
        </Pressable>

        <View style={styles.footer}>
          <AuthButton label="Criar conta" onPress={canSubmit ? onCreateAccount : () => undefined} />
          <AuthLink label="Já tenho conta — Entrar" onPress={onLogin} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  checkbox: {
    alignItems: 'center',
    borderColor: colors.primary,
    borderRadius: 5,
    borderWidth: 1,
    height: 19,
    justifyContent: 'center',
    marginTop: 2,
    width: 19,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
  },
  checkmark: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '900',
  },
  brand: {
    color: colors.primaryDark,
    fontSize: 26,
    fontWeight: '900',
    marginBottom: 12,
  },
  content: {
    flexGrow: 1,
    paddingBottom: 28,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  description: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 18,
  },
  footer: {
    gap: 16,
    marginTop: 18,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  rowItem: {
    flex: 1,
  },
  safeArea: {
    backgroundColor: colors.background,
    flex: 1,
  },
  termsLink: {
    color: colors.primaryDark,
    fontWeight: '800',
    textDecorationLine: 'underline',
  },
  termsRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 10,
    marginTop: 2,
  },
  termsText: {
    color: colors.muted,
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
  },
});
