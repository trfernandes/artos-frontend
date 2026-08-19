import type { TourStep } from '../types';

export const INDISPONIBILIDADES_LIDER_TOUR_ID = 'indisponibilidades-lider';
export const INDISPONIBILIDADES_LIDER_TOUR_TITLE = 'Indisponibilidades do voluntário';

export const INDISPONIBILIDADES_LIDER_TOUR_STEPS: TourStep[] = [
  {
    targetId: 'indisponibilidade-calendario',
    title: 'Para que serve essa tela',
    description:
      'Selecione um voluntário acima para ver e ajustar os dias em que ele não pode ser escalado. Isso evita escalar alguém em uma data que ele já avisou que não pode.',
  },
  {
    targetId: 'indisponibilidade-calendario',
    title: 'Marcar e desmarcar uma data',
    description:
      'Toque em uma data livre para marcar como indisponível para o voluntário selecionado. Toque novamente em uma data já marcada para liberá-la de novo.',
  },
  {
    targetId: 'indisponibilidade-adicionar',
    title: 'Adicionar período',
    description: 'Use este botão para marcar vários dias de uma vez, como férias do voluntário.',
  },
];
