import type { TourStep } from '../types';

export const INDISPONIBILIDADES_LIDER_TOUR_ID = 'indisponibilidades-lider';
export const INDISPONIBILIDADES_LIDER_TOUR_TITLE = 'Indisponibilidades do voluntário';

export const INDISPONIBILIDADES_LIDER_TOUR_STEPS: TourStep[] = [
  {
    targetId: 'indisponibilidade-calendario',
    title: 'Para que serve essa tela',
    description:
      'Selecione um voluntário acima para ver o calendário dele. Cinza são bloqueios pessoais, na cor de destaque são regras deste ministério.',
  },
  {
    targetId: 'indisponibilidade-regras-ministerio',
    title: 'Regras deste ministério',
    description:
      'Aqui ficam as regras que valem só para este ministério. Toque em uma regra para editar, ou use a lixeira para remover.',
  },
  {
    targetId: 'indisponibilidade-regras-fab',
    title: 'Adicionar regra',
    description:
      'Use este botão para criar uma nova regra de indisponibilidade para o voluntário neste ministério — por dia da semana, por período ou limite mensal de escalas.',
  },
];
