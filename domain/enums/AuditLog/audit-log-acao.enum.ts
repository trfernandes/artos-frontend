export enum AuditLogAcaoEnum {
  Criacao = 'CRIACAO',
  Edicao = 'EDICAO',
  Exclusao = 'EXCLUSAO',
}

export const AuditLogAcaoEnumLabel: Record<AuditLogAcaoEnum, string> = {
  [AuditLogAcaoEnum.Criacao]: 'Criação',
  [AuditLogAcaoEnum.Edicao]: 'Edição',
  [AuditLogAcaoEnum.Exclusao]: 'Exclusão',
};
