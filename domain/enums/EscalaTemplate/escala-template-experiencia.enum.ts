export enum EscalaTemplateExperienciaEnum {
  Iniciante = '0',
  Intermediario = '1',
  Avancado = '2',
}

export const EscalaTemplateExperienciaEnumMap: Record<number, EscalaTemplateExperienciaEnum> = {
  '0': EscalaTemplateExperienciaEnum.Iniciante,
  '1': EscalaTemplateExperienciaEnum.Intermediario,
  '2': EscalaTemplateExperienciaEnum.Avancado,
};

export const EscalaTemplateExperienciaLabel: Record<EscalaTemplateExperienciaEnum, string> = {
  [EscalaTemplateExperienciaEnum.Iniciante]: 'Iniciante',
  [EscalaTemplateExperienciaEnum.Intermediario]: 'Intermediário',
  [EscalaTemplateExperienciaEnum.Avancado]: 'Avançado',
};
