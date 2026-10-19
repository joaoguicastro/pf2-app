import { Priority, SymptomId, TriageAnswers } from './triage';

export type Patient = {
  id?: number;
  nome: string;
  email: string;
  chamados?: CallApiResponse[] | null;
};

export type CreatePatientRequest = {
  nome: string;
  dataNascimento: string;
  sexo: string;
  email: string;
  cpf: string;
  senha: string;
};

export type LoginRequest = { email: string; senha: string };

export type SymptomApiResponse = {
  nome: SymptomId;
  label: string;
};

type QuestionApiResponse = {
  chave: string;
  texto: string;
};

export type QuestionnaireApiResponse = {
  discriminadoresGerais: QuestionApiResponse[];
  perguntaFluxograma: QuestionApiResponse[];
};

export type CreateCallRequest = {
  confirmarNovoAtendimento?: boolean;
  sintomaPrincipal: SymptomId;
  discriminadoresGerais: TriageAnswers;
  respostasFluxograma: TriageAnswers;
};

export type CallApiResponse = {
  id: number;
  statusChamado: string;
  prioridadeChamado: Priority;
  dataCriacao: string;
  orientacoes: {
    urgente: boolean;
    mensagemUrgencia: string | null;
    cuidadosCasa: string[];
    sinaisAlerta: string[];
  } | null;
};

export type Hospital = {
  id: number;
  nome: string;
  endereco: string;
  distanciaKm: number | null;
  ocupacaoAtual?: number | null;
  limiteLotacao?: number | null;
  ocupacaoPercentual?: number | null;
  lotada?: boolean | null;
};
export type CheckIn = { chamadoId: number; hospital: Hospital; qrCode: string };

export type HistoryCall = {
  chamadoId: number;
  sintomaPrincipal: SymptomId;
  dataCriacao: string;
  prioridade: Priority;
  status: string;
};

export type HistoryAnswer = { pergunta: string; resposta: boolean | null };
export type HistoryCallDetail = {
  chamadoId: number;
  sintomaPrincipal: SymptomId;
  dataCriacao: string;
  prioridadeChamado: Priority;
  statusChamado: string;
  discriminadoresGerais: HistoryAnswer[];
  respostasFluxograma: HistoryAnswer[];
};
