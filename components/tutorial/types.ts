export type TourStep = {
  targetId: string;
  title: string;
  description: string;
  /** Índice da aba (FancyTabs) onde targetId vive, se a tela tiver abas. A tela deve
   * trocar de aba ao entrar neste passo antes do alvo poder ser medido. */
  tabIndex?: number;
  /** Índice do passo (FancySteps) onde targetId vive, se a tela for um wizard. A tela
   * deve trocar de passo (setIndex) ao entrar neste passo do tour antes do alvo poder
   * ser medido. Diferente do FancyTabs, o FancySteps desmonta o conteúdo dos passos não
   * ativos — por isso a medição do alvo (ver TutorialOverlay) faz retry. */
  wizardIndex?: number;
  /** Quando o alvo é grande demais para o tooltip caber acima ou abaixo dele (ex: um
   * calendário que ocupa a tela toda), força o tooltip a ficar ancorado no rodapé da
   * tela em vez de usar a heurística automática de posicionamento. */
  tooltipPosition?: 'auto' | 'bottom';
};
