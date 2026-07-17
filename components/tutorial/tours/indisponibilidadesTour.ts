import type { TourStep } from '../types';

export const INDISPONIBILIDADES_TOUR_ID = 'indisponibilidades';
export const INDISPONIBILIDADES_TOUR_TITLE = 'Indisponibilidades';

export const INDISPONIBILIDADES_TOUR_STEPS: TourStep[] = [
  {
    targetId: 'indisponibilidade-calendario',
    title: 'Calendário de indisponibilidades',
    description: 'Toque em uma data para marcar como indisponível ou disponível novamente.',
  },
  {
    targetId: 'indisponibilidade-adicionar',
    title: 'Adicionar período',
    description: 'Use este botão para marcar vários dias de uma vez, como férias ou viagens.',
  },
];
