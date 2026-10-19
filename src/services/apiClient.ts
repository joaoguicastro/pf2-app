import { API_URL } from '../config/api';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const AUTH_TOKEN_KEY = 'medmaisfacil.jwt';
let authToken: string | null = null;

export function setAuthToken(token: string | null) { authToken = token; }
export async function saveAuthToken(token: string) {
  authToken = token;
  try {
    if (Platform.OS !== 'web' && await SecureStore.isAvailableAsync()) await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token);
  } catch {
    // Keep this session active in memory if the device cannot persist the token.
  }
}
export async function loadAuthToken() {
  if (Platform.OS === 'web' || !await SecureStore.isAvailableAsync()) return null;
  return SecureStore.getItemAsync(AUTH_TOKEN_KEY);
}
export async function clearAuthToken() {
  authToken = null;
  if (Platform.OS !== 'web' && await SecureStore.isAvailableAsync()) await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
}

type ApiErrorBody = {
  message?: string;
};

export class ApiError extends Error {
  status: number;

  constructor(message: string, status = 0) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export async function apiRequest<T>(path: string, options?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        ...options?.headers,
      },
      signal: controller.signal,
    });

    const body = (await response.json().catch(() => null)) as ApiErrorBody | T | null;

    if (!response.ok) {
      const errorBody = body as ApiErrorBody | null;
      if (response.status === 401) void clearAuthToken();
      throw new ApiError(errorBody?.message || 'Não foi possível concluir a solicitação.', response.status);
    }

    return body as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError('A API demorou para responder. Tente novamente.');
    }
    throw new ApiError('Não foi possível conectar ao servidor. Verifique se a API está ligada.');
  } finally {
    clearTimeout(timeout);
  }
}

export function getApiErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Ocorreu um erro inesperado.';
}
