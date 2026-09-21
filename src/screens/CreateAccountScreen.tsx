import { useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppHeader } from '../components/AppHeader';
import { AuthButton } from '../components/AuthButton';
import { AuthLink } from '../components/AuthLink';
import { AuthTextInput } from '../components/AuthTextInput';
import { getApiErrorMessage } from '../services/apiClient';
import { colors } from '../theme/colors';
import { CreatePatientRequest } from '../types/api';
import { formatCpf } from '../utils/cpf';

type CreateAccountScreenProps = {
  onBack: () => void;
  onCreateAccount: (payload: CreatePatientRequest) => Promise<void>;
  onLogin: () => void;
};

function formatBirthDate(value: string): string {
  return value
    .replace(/\D/g, '')
    .slice(0, 8)
    .replace(/(\d{2})(\d)/, '$1/$2')
    .replace(/(\d{2})(\d)/, '$1/$2');
}

function toIsoDate(value: string): string | null {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  if (!match) return null;
  const [, day, month, year] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  if (
    date.getFullYear() !== Number(year) ||
    date.getMonth() !== Number(month) - 1 ||
    date.getDate() !== Number(day)
  ) {
    return null;
  }
  return `${year}-${month}-${day}`;
}

export function CreateAccountScreen({ onBack, onCreateAccount, onLogin }: CreateAccountScreenProps) {
  const [acceptedTerms, setAcceptedTerms] = useState(true);
  const [fullName, setFullName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState('');
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit =
    acceptedTerms &&
    fullName.trim().length > 0 &&
    birthDate.trim().length === 10 &&
    gender.trim().length > 0 &&
    cpf.length === 14 &&
    email.trim().length > 0 &&
    password.length >= 8 &&
    password === confirmPassword;

  async function handleCreateAccount() {
    if (!canSubmit || isSubmitting) return;
    const dataNascimento = toIsoDate(birthDate);
    if (!dataNascimento) {
      setError('Informe uma data de nascimento válida no formato DD/MM/AAAA.');
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      await onCreateAccount({
        cpf,
        dataNascimento,
        email: email.trim(),
        nome: fullName.trim(),
        senha: password,
        sexo: gender.trim(),
      });
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader onBack={onBack} title="Criar conta" />

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.brand}>Med+Facil</Text>
        <Text style={styles.description}>
          Crie seu cadastro para enviar as respostas da triagem e receber a orientação inicial.
        </Text>

        <AuthTextInput label="Nome completo" onChangeText={setFullName} value={fullName} />

        <View style={styles.row}>
          <View style={styles.rowItem}>
            <AuthTextInput
              keyboardType="number-pad"
              label="Nascimento"
              maxLength={10}
              onChangeText={(value) => setBirthDate(formatBirthDate(value))}
              placeholder="DD/MM/AAAA"
              value={birthDate}
            />
          </View>
          <View style={styles.rowItem}>
            <AuthTextInput label="Sexo" onChangeText={setGender} value={gender} />
          </View>
        </View>

        <AuthTextInput
          keyboardType="number-pad"
          label="CPF"
          onChangeText={(value) => setCpf(formatCpf(value))}
          placeholder="000.000.000-00"
          value={cpf}
        />

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

        {error ? <Text style={styles.error}>{error}</Text> : null}

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
          <AuthButton
            disabled={!canSubmit || isSubmitting}
            label={isSubmitting ? 'Criando conta...' : 'Criar conta'}
            onPress={handleCreateAccount}
          />
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
  error: {
    backgroundColor: colors.dangerLight,
    borderRadius: 8,
    color: colors.danger,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 8,
    padding: 12,
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
