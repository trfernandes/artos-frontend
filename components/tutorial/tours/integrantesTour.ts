import type { TourStep } from '../types';

export const INTEGRANTES_TOUR_ID = 'integrantes-lider';
export const INTEGRANTES_TOUR_TITLE = 'Integrantes';

export const INTEGRANTES_TOUR_STEPS: TourStep[] = [
  {
    targetId: 'integrantes-fab',
    title: 'Adicione sua equipe',
    description:
      'Toque aqui para convidar ou cadastrar um voluntário no ministério. Sem integrantes, não é possível montar uma escala.',
  },
];
