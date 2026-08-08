export type ResponseEventoSetlistObservacoesDto = {
  eventoId: string;
  ministerioId: string;
  dataOcorrencia: string;
  observacoes?: string | null;
  atualizadoPorVoluntarioId?: string | null;
};
