export interface NotificacaoTipoPreferenciaDto {
  lembretes?: boolean;
  comunicados?: boolean;
}

export interface UpdateIgrejaNotificacoesDto {
  notificacoesHabilitadas: boolean;
  antecedenciaHoras?: number;
  lembretesHoras: number[];
  canaisPush: boolean;
  canaisWhatsapp: boolean;
  preferenciasPorTipo?: Record<string, NotificacaoTipoPreferenciaDto>;
}
