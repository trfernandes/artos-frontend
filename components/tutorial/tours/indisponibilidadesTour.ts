import type { TourStep } from '../types';

export const INDISPONIBILIDADES_TOUR_ID = 'indisponibilidades';
export const INDISPONIBILIDADES_TOUR_TITLE = 'Indisponibilidades';

export const INDISPONIBILIDADES_TOUR_STEPS: TourStep[] = [
  {
    targetId: 'indisponibilidade-calendario',
    title: 'Para que serve essa tela',
    description:
      'Aqui você avisa em quais dias não pode servir. Quem monta a escala do seu ministério vê essas datas e evita te escalar nelas.',
    tooltipPosition: 'bottom',
  },
  {
    targetId: 'indisponibilidade-calendario',
    title: 'Marcar e desmarcar uma data',
    description:
      'Toque em uma data livre para marcar como indisponível. Toque novamente em uma data já marcada para deixá-la disponível de novo.',
    tooltipPosition: 'bottom',
  },
  {
    targetId: 'indisponibilidade-adicionar',
    title: 'Adicionar período',
    description: 'Use este botão para marcar vários dias de uma vez, como férias ou viagens.',
  },
  {
    targetId: 'indisponibilidade-regras-lista',
    title: 'Regras recorrentes',
    description:
      'Em vez de marcar data por data, crie uma regra: "todo domingo", "máximo 2 escalas por mês"... Ela vale automaticamente pra sempre, sem precisar repetir.',
    tabIndex: 1,
    tooltipPosition: 'bottom',
  },
  {
    targetId: 'indisponibilidade-regras-fab',
    title: 'Criar uma regra',
    description: 'Toque aqui para criar uma nova regra de indisponibilidade recorrente.',
    tabIndex: 1,
  },
];
