export enum SuporteTipoEnum {
  Sugestao = 'SUGESTAO',
  Reclamacao = 'RECLAMACAO',
  Bug = 'BUG',
  ComercialAjuda = 'COMERCIAL_AJUDA',
}

export const SuporteTipoEnumLabel: Record<SuporteTipoEnum, string> = {
  [SuporteTipoEnum.Sugestao]: 'Sugestão',
  [SuporteTipoEnum.Reclamacao]: 'Reclamação',
  [SuporteTipoEnum.Bug]: 'Bug',
  [SuporteTipoEnum.ComercialAjuda]: 'Comercial / Ajuda pra começar',
};

export const SuporteTipoEnumDescricao: Record<SuporteTipoEnum, string> = {
  [SuporteTipoEnum.Sugestao]: 'Ideia pra melhorar o app',
  [SuporteTipoEnum.Reclamacao]: 'Algo não funcionou como esperado',
  [SuporteTipoEnum.Bug]: 'Erro técnico, tela travada ou quebrada',
  [SuporteTipoEnum.ComercialAjuda]: 'Migração, escolha de plano, igreja grande',
};
