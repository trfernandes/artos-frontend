export enum EscalaTemplateTipoEnum {
  Fixo = '0',
  Funcoes = '1',
}

export const EscalaTemplateTipoEnumMap: Record<number, EscalaTemplateTipoEnum> = {
  '0': EscalaTemplateTipoEnum.Fixo,
  '1': EscalaTemplateTipoEnum.Funcoes,
};

export const EscalaTemplateTipoLabel: Record<EscalaTemplateTipoEnum, string> = {
  [EscalaTemplateTipoEnum.Fixo]: 'Fixo',
  [EscalaTemplateTipoEnum.Funcoes]: 'Funções',
};
