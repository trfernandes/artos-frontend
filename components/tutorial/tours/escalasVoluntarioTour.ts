import type { TourStep } from '../types';

export const ESCALAS_VOLUNTARIO_TOUR_ID = 'escalas-voluntario';
export const ESCALAS_VOLUNTARIO_TOUR_TITLE = 'Minhas Escalas';

export const ESCALAS_VOLUNTARIO_TOUR_STEPS: TourStep[] = [
  {
    targetId: 'escalas-calendario',
    title: 'Suas datas de serviço',
    description:
      'Os dias marcados no calendário são os dias em que você foi escalado. Toque em uma data para ver os eventos daquele dia.',
  },
  {
    targetId: 'escalas-lista-dia',
    title: 'Confirmar ou pedir substituição',
    description:
      'Toque em um evento para ver os detalhes. De lá você confirma sua presença ou pede para outra pessoa te substituir, caso não possa ir.',
  },
];
