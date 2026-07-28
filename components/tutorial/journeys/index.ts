import type { Journey } from './types';
import { INDISPONIBILIDADES_TOUR_ID } from '../tours/indisponibilidadesTour';
import { ESCALAS_VOLUNTARIO_TOUR_ID } from '../tours/escalasVoluntarioTour';
import { INTEGRANTES_TOUR_ID } from '../tours/integrantesTour';
import { FUNCOES_TOUR_ID } from '../tours/funcoesTour';
import { TEMPLATES_EQUIPE_TOUR_ID } from '../tours/templatesEquipeTour';
import { ESCALAS_LIDER_TOUR_ID } from '../tours/escalasLiderTour';
import { ESCALA_ASSISTENTE_TOUR_ID } from '../tours/escalaAssistenteTour';

export const VOLUNTARIO_JOURNEY_ID = 'voluntario-primeiros-passos';
export const LIDER_JOURNEY_ID = 'lider-primeiros-passos';

// Catálogo estático das jornadas guiadas multi-tela. Rotas dos passos do líder usam
// `{ministerioId}` — interpolado a partir dos `params` passados a `startJourney`.
export const JOURNEYS: Record<string, Journey> = {
  [VOLUNTARIO_JOURNEY_ID]: {
    id: VOLUNTARIO_JOURNEY_ID,
    title: 'Primeiros passos',
    steps: [
      { route: '/(app)/(drawer)/pessoal/indisponibilidade', tourId: INDISPONIBILIDADES_TOUR_ID },
      { route: '/(app)/(drawer)/pessoal/escalas', tourId: ESCALAS_VOLUNTARIO_TOUR_ID },
    ],
  },
  [LIDER_JOURNEY_ID]: {
    id: LIDER_JOURNEY_ID,
    title: 'Monte sua equipe e crie uma escala',
    steps: [
      {
        route: '/(app)/(drawer)/ministerios/integrantes?ministerioId={ministerioId}',
        tourId: INTEGRANTES_TOUR_ID,
      },
      {
        route: '/(app)/(drawer)/ministerios/funcoes?ministerioId={ministerioId}',
        tourId: FUNCOES_TOUR_ID,
      },
      {
        route: '/(app)/(drawer)/ministerios/templates_equipe?ministerioId={ministerioId}',
        tourId: TEMPLATES_EQUIPE_TOUR_ID,
      },
      {
        route: '/(app)/(drawer)/ministerios/escalas?ministerioId={ministerioId}',
        tourId: ESCALAS_LIDER_TOUR_ID,
      },
      {
        route: '/(app)/(drawer)/ministerios/escalas/assistant?ministerioId={ministerioId}',
        tourId: ESCALA_ASSISTENTE_TOUR_ID,
      },
    ],
  },
};

export function getJourney(id: string): Journey | null {
  return JOURNEYS[id] ?? null;
}
