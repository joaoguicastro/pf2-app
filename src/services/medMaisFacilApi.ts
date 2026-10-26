import { formatCpf } from '../utils/cpf';
import { symptomPresentation } from '../data/triage';
import {
  CallApiResponse,
  CreateCallRequest,
  CreatePatientRequest,
  Patient,
  LoginRequest,
  HistoryCall,
  HistoryCallDetail,
  QuestionnaireApiResponse,
  SymptomApiResponse,
} from '../types/api';
import { SymptomId, SymptomOption, TriageQuestionnaire, TriageResult } from '../types/triage';
import { ApiError, apiRequest } from './apiClient';

export function createPatient(payload: CreatePatientRequest): Promise<Patient> {
  return apiRequest<Patient>('/v1/paciente', {
    body: JSON.stringify(payload),
    method: 'POST',
  });
}

export async function listSymptoms(): Promise<SymptomOption[]> {
  const response = await apiRequest<SymptomApiResponse[]>('/v1/sintoma');

  return response.map((symptom) => ({
    id: symptom.nome,
    label: symptom.label,
    ...symptomPresentation[symptom.nome],
  }));
}

export async function getQuestionnaire(symptomId: SymptomId): Promise<TriageQuestionnaire> {
  const response = await apiRequest<QuestionnaireApiResponse>(
    `/v1/sintoma/${symptomId}/perguntas`,
  );
  const mapQuestion = (question: { chave: string; texto: string }) => ({
    key: question.chave,
    text: question.texto,
  });

  return {
    discriminadoresGerais: response.discriminadoresGerais.map(mapQuestion),
    perguntaFluxograma: response.perguntaFluxograma.map(mapQuestion),
  };
}

export async function createCall(payload: CreateCallRequest): Promise<TriageResult> {
  const classifierKeys: Record<string, string> = {
    IRRADIA_BRANCO_MANDIBULA: 'IRRADIA_BRACO_MANDIBULA',
    NAUSE_VOMITO_FORTE: 'NAUSEA_VOMITO_FORTE',
    LEVE_MELHORA_REPOPUSO: 'LEVE_MELHORA_REPOUSO',
  };
  const respostasFluxograma = Object.fromEntries(
    Object.entries(payload.respostasFluxograma).map(([key, answer]) => [
      classifierKeys[key] ?? key,
      answer,
    ]),
  );
  const response = await apiRequest<CallApiResponse>('/v1/paciente/me/chamado', {
    body: JSON.stringify({
      ...payload,
      respostasFluxograma,
      confirmarNovoAtendimento: payload.confirmarNovoAtendimento ?? false,
    }),
    method: 'POST',
  });

  if (!response.orientacoes) {
    throw new ApiError('A API não retornou as orientações da triagem.');
  }

  return {
    createdAt: response.dataCriacao,
    id: response.id,
    orientation: {
      homeCare: response.orientacoes.cuidadosCasa,
      message:
        response.orientacoes.mensagemUrgencia ||
        'No momento, siga os cuidados recomendados e observe qualquer mudança nos sintomas.',
      urgent: response.orientacoes.urgente,
      warningSigns: response.orientacoes.sinaisAlerta,
    },
    priority: response.prioridadeChamado,
    status: response.statusChamado,
  };
}

export function listHospitals(symptomId: SymptomId, coordinates?: { latitude: number; longitude: number }) {
  const query = new URLSearchParams({ sintoma: symptomId });
  if (coordinates) {
    query.set('latitude', String(coordinates.latitude));
    query.set('longitude', String(coordinates.longitude));
  }
  return apiRequest<import('../types/api').Hospital[]>(`/v1/unidades-saude?${query}`);
}

export function selectHospital(patientId: number, callId: number, hospitalId: number) {
  return apiRequest<import('../types/api').CheckIn>(`/v1/paciente/${patientId}/chamado/${callId}/encaminhamento`, {
    method: 'PUT', body: JSON.stringify({ unidadeSaudeId: hospitalId }),
  });
}

export async function identifyPatient(cpf: string): Promise<Patient> {
  if (cpf.replace(/\D/g, '').length !== 11) {
    throw new ApiError('Informe um CPF com 11 dígitos.');
  }
  try {
    const patient = await apiRequest<Patient>(`/v1/paciente/${encodeURIComponent(formatCpf(cpf))}`);
    if (!patient || !Number.isInteger(patient.id) || (patient.id ?? 0) <= 0 ||
        typeof patient.nome !== 'string' || typeof patient.email !== 'string') {
      throw new ApiError('Não foi possível identificar seu cadastro. Verifique se a API está atualizada.');
    }
    return patient;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      throw new ApiError('Cadastro não encontrado. Confira o CPF ou crie uma conta.', 404);
    }
    throw error;
  }
}

function decodeTokenPayload(token: string): { sub?: string; nome?: string; exp?: number } {
  try {
    const encoded = token.split('.')[1];
    if (!encoded) throw new Error('Token inválido.');
    const base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    const binary = globalThis.atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '='));
    const json = decodeURIComponent(Array.from(binary, char => `%${char.charCodeAt(0).toString(16).padStart(2, '0')}`).join(''));
    return JSON.parse(json);
  } catch {
    throw new ApiError('O login retornou um token inválido. Tente novamente.');
  }
}

export function patientFromToken(token: string, email = ''): Patient {
  const claims = decodeTokenPayload(token);
  const id = Number(claims.sub);
  if (!Number.isInteger(id) || id <= 0 || (claims.exp && claims.exp * 1000 <= Date.now())) {
    throw new ApiError('O token de acesso expirou ou não contém um paciente válido.', 401);
  }
  return {
    id,
    nome: typeof claims.nome === 'string' ? claims.nome : email.split('@')[0] || 'Paciente',
    email,
  };
}

export async function loginPatient(payload: LoginRequest): Promise<{ token: string; patient: Patient }> {
  const response = await apiRequest<{ token: string }>('/v1/auth/login', {
    method: 'POST', body: JSON.stringify(payload),
  });
  if (typeof response?.token !== 'string') throw new ApiError('A API não retornou o token de acesso.');
  return { token: response.token, patient: patientFromToken(response.token, payload.email) };
}

export function listPatientHistory(): Promise<HistoryCall[]> {
  return apiRequest<HistoryCall[]>('/v1/paciente/me/historico');
}

export function getPatientHistoryDetail(patientId: number, callId: number): Promise<HistoryCallDetail> {
  return apiRequest<HistoryCallDetail>(`/v1/paciente/${patientId}/historico/${callId}`);
}
