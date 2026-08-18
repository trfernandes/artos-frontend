import type { TourStep } from '../types';

export const ESCALA_MANUAL_TOUR_ID = 'escala-manual';
export const ESCALA_MANUAL_TOUR_TITLE = 'Criar escala manualmente';

export const ESCALA_MANUAL_TOUR_STEPS: TourStep[] = [
  {
    targetId: 'escala-manual-criar',
    title: 'Escala em branco',
    description:
      'Aqui você define nome e período. A escala começa vazia — depois você adiciona os eventos e os voluntários diretamente na tela de edição.',
  },
];
