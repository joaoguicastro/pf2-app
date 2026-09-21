export type SymptomId =
  | 'DOR_TORACICA'
  | 'DISPNEIA'
  | 'FEBRE'
  | 'DOR_ABDOMINAL'
  | 'CEFALEIA';

export type Priority = 'VERMELHO' | 'LARANJA' | 'AMARELO' | 'VERDE' | 'AZUL';

export type TriageQuestion = {
  key: string;
  text: string;
};

export type SymptomOption = {
  id: SymptomId;
  label: string;
  shortLabel: string;
  description: string;
};

export type TriageAnswers = Record<string, boolean>;

export type TriageQuestionnaire = {
  discriminadoresGerais: TriageQuestion[];
  perguntaFluxograma: TriageQuestion[];
};

export type TriageSubmission = {
  sintomaPrincipal: SymptomId;
  discriminadoresGerais: TriageAnswers;
  respostasFluxograma: TriageAnswers;
};

export type TriageOrientation = {
  urgent: boolean;
  message: string;
  homeCare: string[];
  warningSigns: string[];
};

export type TriageResult = {
  createdAt: string;
  id: number;
  priority: Priority;
  status: string;
  orientation: TriageOrientation;
};
