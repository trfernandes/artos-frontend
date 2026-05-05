export type DashboardEscalaItemDto = {
  id: string;
  eventoNome: string;
  eventoData: string;
  funcaoNome: string;
  ministerioNome: string;
  ministerioLogoUrl?: string;
  eventoLocal?: string;
  isConfirmado: boolean;
};

export type DashboardMinisterioStatsDto = {
  ministerioId: string;
  ministerioNome: string;
  ministerioLogoUrl?: string;
  totalVoluntarios: number;
  totalFuncoes: number;
  totalEscalasAtivas: number;
  percentualPreenchimento?: number;
  funcoesDescobertas?: number;
};

export type DashboardEventoProximoDto = {
  id: string;
  occurrenceKey: string;
  nome: string;
  dataInicio: string;
  local?: string;
  cor: string;
  totalEscalados: number;
  totalConfirmados: number;
  totalFuncoes: number;
  percentualPreenchido: number;
};

export type DashboardSolicitacaoDto = {
  id: string;
  voluntarioNome: string;
  voluntarioFoto?: string;
  ministerioNome?: string;
  dataSolicitacao: string;
  tipo: 'entrada' | 'substituicao';
};

export type ResponseDashboardDto = {
  // Para Voluntários
  proximasEscalas?: DashboardEscalaItemDto[];
  totalEscalasMes?: number;
  escalasConfirmadas?: number;
  escalasPendentes?: number;

  // Para Líderes de Ministério
  ministerioStats?: DashboardMinisterioStatsDto;
  proximosEventosMinisterio?: DashboardEventoProximoDto[];
  solicitacoesPendentes?: DashboardSolicitacaoDto[];

  // Para Líderes da Igreja
  totalMinisterios?: number;
  totalVoluntarios?: number;
  totalEventosMes?: number;
  ministeriosStats?: DashboardMinisterioStatsDto[];
  proximosEventosIgreja?: DashboardEventoProximoDto[];
  solicitacoesGerais?: DashboardSolicitacaoDto[];
};
