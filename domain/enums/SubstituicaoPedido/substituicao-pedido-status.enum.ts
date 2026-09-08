export enum SubstituicaoPedidoStatusEnum {
  Aberto = 'Aberto',
  Resolvido = 'Resolvido',
  Cancelado = 'Cancelado',
  SemCandidato = 'SemCandidato',
}

export const SubstituicaoPedidoStatusEnumLabel: Record<SubstituicaoPedidoStatusEnum, string> = {
  [SubstituicaoPedidoStatusEnum.Aberto]: 'Em busca',
  [SubstituicaoPedidoStatusEnum.Resolvido]: 'Resolvido',
  [SubstituicaoPedidoStatusEnum.Cancelado]: 'Cancelado',
  [SubstituicaoPedidoStatusEnum.SemCandidato]: 'Sem candidato',
};
