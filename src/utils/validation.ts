export const PASSWORD_MIN_LENGTH = 6;
export const MIN_AGE = 0;
export const MAX_AGE = 120;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const NAME_PATTERN = /^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/;

export function parseBirthDate(value: string): Date | null {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  if (!match) return null;
  const [, day, month, year] = match.map(Number);
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null;
  }
  return date;
}

export function calculateAge(birthDate: Date, today = new Date()): number {
  let age = today.getFullYear() - birthDate.getFullYear();
  const hadBirthday =
    today.getMonth() > birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate());
  if (!hadBirthday) age -= 1;
  return age;
}

export function validateName(value: string): string | null {
  const name = value.trim().replace(/\s+/g, ' ');
  if (!name) return 'Informe seu nome completo.';
  if (!NAME_PATTERN.test(name)) return 'Use apenas letras no nome.';
  if (name.split(' ').length < 2) return 'Informe nome e sobrenome.';
  if (name.length > 100) return 'O nome deve ter no máximo 100 caracteres.';
  return null;
}

export function validateBirthDate(value: string): string | null {
  if (!value) return 'Informe sua data de nascimento.';
  const date = parseBirthDate(value);
  if (!date) return 'Data inválida. Use o formato DD/MM/AAAA.';
  if (date > new Date()) return 'A data de nascimento não pode estar no futuro.';
  const age = calculateAge(date);
  if (age < MIN_AGE || age > MAX_AGE) return `A idade deve estar entre ${MIN_AGE} e ${MAX_AGE} anos.`;
  return null;
}

export function validateGender(value: string): string | null {
  return value ? null : 'Selecione uma opção.';
}

export function isValidCpf(value: string): boolean {
  const digits = value.replace(/\D/g, '');
  if (digits.length !== 11 || /^(\d)\1{10}$/.test(digits)) return false;
  const checkDigit = (length: number) => {
    let sum = 0;
    for (let i = 0; i < length; i++) sum += Number(digits[i]) * (length + 1 - i);
    const rest = (sum * 10) % 11;
    return rest === 10 ? 0 : rest;
  };
  return checkDigit(9) === Number(digits[9]) && checkDigit(10) === Number(digits[10]);
}

export function validateCpf(value: string): string | null {
  if (!value) return 'Informe seu CPF.';
  if (value.length !== 14) return 'O CPF deve ter 11 dígitos.';
  if (!isValidCpf(value)) return 'CPF inválido.';
  return null;
}

export function validateEmail(value: string): string | null {
  const email = value.trim();
  if (!email) return 'Informe seu e-mail.';
  if (!EMAIL_PATTERN.test(email)) return 'Informe um e-mail válido.';
  return null;
}

export function validatePassword(value: string): string | null {
  if (!value) return 'Informe uma senha.';
  if (value.length < PASSWORD_MIN_LENGTH) return `A senha deve ter no mínimo ${PASSWORD_MIN_LENGTH} caracteres.`;
  return null;
}

export function validatePasswordConfirmation(password: string, confirmation: string): string | null {
  if (!confirmation) return 'Confirme sua senha.';
  if (password !== confirmation) return 'As senhas não coincidem.';
  return null;
}
