import { Priority, SymptomId, SymptomOption } from '../types/triage';

export const symptomPresentation: Record<
  SymptomId,
  Pick<SymptomOption, 'shortLabel' | 'description'>
> = {
  DOR_TORACICA: {
    shortLabel: 'PEITO',
    description: 'Dor, pressão ou desconforto na região do peito.',
  },
  DISPNEIA: {
    shortLabel: 'AR',
    description: 'Dificuldade para respirar ou sensação de pouco ar.',
  },
  FEBRE: {
    shortLabel: '38°',
    description: 'Temperatura elevada, calafrios ou mal-estar.',
  },
  DOR_ABDOMINAL: {
    shortLabel: 'ABD',
    description: 'Dor, cólica ou desconforto na região abdominal.',
  },
  CEFALEIA: {
    shortLabel: 'CABEÇA',
    description: 'Dor, pressão ou pulsação na cabeça.',
  },
};

export const priorityDetails: Record<
  Priority,
  { color: string; lightColor: string; label: string; action: string }
> = {
  VERMELHO: {
    color: '#C62828',
    lightColor: '#FDECEC',
    label: 'Emergência',
    action: 'Procure atendimento imediatamente.',
  },
  LARANJA: {
    color: '#D96B16',
    lightColor: '#FFF0E4',
    label: 'Muito urgente',
    action: 'Procure atendimento o quanto antes.',
  },
  AMARELO: {
    color: '#A97700',
    lightColor: '#FFF7D9',
    label: 'Urgente',
    action: 'É recomendada uma avaliação profissional.',
  },
  VERDE: {
    color: '#25875F',
    lightColor: '#EAF7F0',
    label: 'Pouco urgente',
    action: 'Acompanhe os sintomas e siga as orientações.',
  },
  AZUL: {
    color: '#257CB6',
    lightColor: '#E8F4FC',
    label: 'Não urgente',
    action: 'Cuidados em casa podem ajudar neste momento.',
  },
};
