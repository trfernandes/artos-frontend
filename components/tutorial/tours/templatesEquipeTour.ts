import type { TourStep } from '../types';

export const TEMPLATES_EQUIPE_TOUR_ID = 'templates-equipe-lider';
export const TEMPLATES_EQUIPE_TOUR_TITLE = 'Templates de Equipe';

export const TEMPLATES_EQUIPE_TOUR_STEPS: TourStep[] = [
  {
    targetId: 'templates-equipe-fab',
    title: 'Monte um modelo de equipe',
    description:
      'Um template define quem (equipe fixa) ou quantas pessoas por função compõem um evento. Use-o depois no assistente de escalas para preencher tudo automaticamente.',
  },
];
