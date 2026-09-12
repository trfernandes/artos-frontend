export type PassoChecklistOnboardingDto = {
  chave: string;
  label: string;
  concluido: boolean;
};

export type ResponseChecklistOnboardingDto = {
  passos: PassoChecklistOnboardingDto[];
  concluidos: number;
  total: number;
  proximoPendente: PassoChecklistOnboardingDto | null;
};
