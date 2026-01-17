export enum IgrejaJoinModeEnum {
  INVITE_ONLY = 'INVITE_ONLY', // só por convite (token/link/QR)
  CODE_APPROVAL = 'CODE_APPROVAL', // por código, entra pendente e líder aprova
  CODE_FREE = 'CODE_FREE', // por código, entra direto
}
