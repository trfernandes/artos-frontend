export type JourneyStep = {
  /** Rota (expo-router) pra onde navegar ao entrar neste passo da jornada. Pode conter
   * placeholders como `{ministerioId}`, substituídos pelos `params` passados a
   * `startJourney`. */
  route: string;
  /** tourId da tela (o mesmo id passado a useScreenTutorial nessa rota). */
  tourId: string;
};

export type Journey = {
  id: string;
  title: string;
  steps: JourneyStep[];
};
