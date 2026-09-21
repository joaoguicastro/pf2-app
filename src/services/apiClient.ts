import { API_URL } from '../config/api';

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
        ...options?.headers,
      },
      signal: controller.signal,
    });

    const body = (await response.json().catch(() => null)) as ApiErrorBody | T | null;

    if (!response.ok) {
      const errorBody = body as ApiErrorBody | null;
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
