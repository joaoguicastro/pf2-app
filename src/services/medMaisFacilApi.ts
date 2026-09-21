import { symptomPresentation } from '../data/triage';
import {
  CallApiResponse,
  CreateCallRequest,
  CreatePatientRequest,
  Patient,
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

export async function createCall(patientId: number, payload: CreateCallRequest): Promise<TriageResult> {
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
  const response = await apiRequest<CallApiResponse>(`/v1/paciente/${patientId}/chamado`, {
    body: JSON.stringify({ ...payload, respostasFluxograma }),
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
