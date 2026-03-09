export enum NotificacaoTipoEnum {
  // Voluntário
  EscalaLembrete = 'ESCALA_LEMBRETE',
  EscalaPublicada = 'ESCALA_PUBLICADA',
  EscalaSubstituicaoSolicitada = 'ESCALA_SUBSTITUICAO_SOLICITADA',
  EscalaSubstituicaoAceita = 'ESCALA_SUBSTITUICAO_ACEITA',
  EscalaSubstituicaoRecusada = 'ESCALA_SUBSTITUICAO_RECUSADA',
  EscalaAlterada = 'ESCALA_ALTERADA',
  EscalaCancelada = 'ESCALA_CANCELADA',
  EscalaConfirmacaoPendente = 'ESCALA_CONFIRMACAO_PENDENTE',

  // Líder de Ministério
  EscalaVoluntarioConfirmou = 'ESCALA_VOLUNTARIO_CONFIRMOU',
  EscalaVoluntarioRecusou = 'ESCALA_VOLUNTARIO_RECUSOU',
  EscalaSubstituicaoSolicitadaLider = 'ESCALA_SUBSTITUICAO_SOLICITADA_LIDER',
  EscalaSubstituicaoResolvidaLider = 'ESCALA_SUBSTITUICAO_RESOLVIDA_LIDER',
  MinisterioNovoIntegrante = 'MINISTERIO_NOVO_INTEGRANTE',
  IndisponibilidadeConflito = 'INDISPONIBILIDADE_CONFLITO',

  // Responsável da Igreja (Admin)
  IgrejaConviteAceito = 'IGREJA_CONVITE_ACEITO',
  IgrejaVinculoSolicitado = 'IGREJA_VINCULO_SOLICITADO',
  IgrejaVinculoAprovado = 'IGREJA_VINCULO_APROVADO',
  IgrejaVinculoNegado = 'IGREJA_VINCULO_NEGADO',
  IgrejaNovoVoluntario = 'IGREJA_NOVO_VOLUNTARIO',
  IgrejaConviteExpirado = 'IGREJA_CONVITE_EXPIRADO',

  // Dev
  TesteLocal = 'TESTE_LOCAL',
  Generic = 'GENERIC',
}
