import { useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppHeader } from '../components/AppHeader';
import { AuthButton } from '../components/AuthButton';
import { AuthLink } from '../components/AuthLink';
import { AuthTextInput } from '../components/AuthTextInput';
import { useSnackbar } from '../components/Snackbar';
import { getApiErrorMessage } from '../services/apiClient';
import { colors } from '../theme/colors';
import { CreatePatientRequest } from '../types/api';
import { formatCpf } from '../utils/cpf';
import {
  PASSWORD_MIN_LENGTH,
  calculateAge,
  parseBirthDate,
  validateBirthDate,
  validateCpf,
  validateEmail,
  validateGender,
  validateName,
  validatePassword,
  validatePasswordConfirmation,
} from '../utils/validation';

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

const genderOptions = ['Feminino', 'Masculino', 'Outro'];

type Field = 'fullName' | 'birthDate' | 'gender' | 'cpf' | 'email' | 'password' | 'confirmPassword';

function toIsoDate(value: string): string {
  const [day, month, year] = value.split('/');
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showError } = useSnackbar();
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const fieldErrors: Record<Field, string | null> = {
    birthDate: validateBirthDate(birthDate),
    confirmPassword: validatePasswordConfirmation(password, confirmPassword),
    cpf: validateCpf(cpf),
    email: validateEmail(email),
    fullName: validateName(fullName),
    gender: validateGender(gender),
    password: validatePassword(password),
  };
  const hasFieldErrors = Object.values(fieldErrors).some(Boolean);
  const birth = parseBirthDate(birthDate);
  const ageHelper = birth && !fieldErrors.birthDate ? `${calculateAge(birth)} anos` : undefined;

  function visibleError(field: Field) {
    return submitAttempted || touched[field] ? fieldErrors[field] : null;
  }

  function markTouched(field: Field) {
    setTouched((current) => ({ ...current, [field]: true }));
  }

  async function handleCreateAccount() {
    if (isSubmitting) return;
    setSubmitAttempted(true);
    if (hasFieldErrors) {
      showError('Corrija os campos destacados para continuar.');
      return;
    }
    if (!acceptedTerms) {
      showError('Aceite os Termos de Uso e a Política de Privacidade para continuar.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onCreateAccount({
        cpf,
        dataNascimento: toIsoDate(birthDate),
        email: email.trim(),
        nome: fullName.trim().replace(/\s+/g, ' '),
        senha: password,
        sexo: gender,
      });
    } catch (requestError) {
      showError(getApiErrorMessage(requestError));
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

        <AuthTextInput
          autoCapitalize="words"
          autoComplete="name"
          error={visibleError('fullName')}
          label="Nome completo"
          maxLength={100}
          onBlur={() => markTouched('fullName')}
          onChangeText={setFullName}
          value={fullName}
        />

        <AuthTextInput
          error={visibleError('birthDate')}
          helperText={ageHelper}
          keyboardType="number-pad"
          label="Data de nascimento"
          maxLength={10}
          onBlur={() => markTouched('birthDate')}
          onChangeText={(value) => setBirthDate(formatBirthDate(value))}
          placeholder="DD/MM/AAAA"
          value={birthDate}
        />

        <View style={styles.genderGroup}>
          <Text style={styles.label}>Sexo</Text>
          <View accessibilityRole="radiogroup" style={styles.row}>
            {genderOptions.map((option) => (
              <Pressable
                accessibilityRole="radio"
                accessibilityState={{ checked: gender === option }}
                key={option}
                onPress={() => { setGender(option); markTouched('gender'); }}
                style={[
                  styles.genderOption,
                  gender === option && styles.genderOptionSelected,
                  !!visibleError('gender') && styles.genderOptionError,
                ]}
              >
                <Text style={[styles.genderText, gender === option && styles.genderTextSelected]}>{option}</Text>
              </Pressable>
            ))}
          </View>
          {visibleError('gender') ? (
            <Text accessibilityRole="alert" style={styles.fieldError}>{visibleError('gender')}</Text>
          ) : null}
        </View>

        <AuthTextInput
          error={visibleError('cpf')}
          keyboardType="number-pad"
          label="CPF"
          maxLength={14}
          onBlur={() => markTouched('cpf')}
          onChangeText={(value) => setCpf(formatCpf(value))}
          placeholder="000.000.000-00"
          value={cpf}
        />

        <AuthTextInput
          autoCapitalize="none"
          autoComplete="email"
          autoCorrect={false}
          error={visibleError('email')}
          keyboardType="email-address"
          label="E-mail"
          onBlur={() => markTouched('email')}
          onChangeText={setEmail}
          placeholder="voce@exemplo.com"
          value={email}
        />

        <AuthTextInput
          autoCapitalize="none"
          autoComplete="new-password"
          error={visibleError('password')}
          helperText={`Mínimo de ${PASSWORD_MIN_LENGTH} caracteres.`}
          label="Senha"
          onBlur={() => markTouched('password')}
          onChangeText={setPassword}
          secureTextEntry
          value={password}
        />

        <AuthTextInput
          autoCapitalize="none"
          error={visibleError('confirmPassword')}
          label="Confirmar senha"
          onBlur={() => markTouched('confirmPassword')}
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
          <AuthButton
            disabled={isSubmitting}
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
  fieldError: {
    color: colors.danger,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 4,
  },
  footer: {
    gap: 16,
    marginTop: 18,
  },
  genderGroup: {
    marginBottom: 16,
  },
  genderOption: {
    alignItems: 'center',
    backgroundColor: colors.inputBackground,
    borderColor: colors.border,
    borderRadius: 10,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: 42,
  },
  genderOptionError: {
    borderColor: colors.danger,
  },
  genderOptionSelected: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  genderText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  genderTextSelected: {
    color: colors.primaryDark,
  },
  label: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 7,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
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
