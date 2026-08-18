import type { TourStep } from '../types';

export const ESCALA_ASSISTENTE_TOUR_ID = 'escala-assistente';
export const ESCALA_ASSISTENTE_TOUR_TITLE = 'Assistente de Escala';

export const ESCALA_ASSISTENTE_TOUR_STEPS: TourStep[] = [
  {
    targetId: 'assistente-eventos-lista',
    title: 'Defina a equipe de cada evento',
    description:
      'Eventos sem um template definido aparecem com um aviso. Toque no lápis para escolher a equipe (fixa ou por funções) daquele evento antes de continuar.',
    wizardIndex: 1,
  },
  {
    targetId: 'assistente-participantes-lista',
    title: 'Só entram voluntários com função ativa',
    description:
      'Aqui você escolhe quem participa da escala. Só aparecem voluntários que já têm uma função ativa cadastrada — sem isso, cadastre a função primeiro.',
    wizardIndex: 2,
  },
];
