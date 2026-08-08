export enum EventoSetlistItemOrigemEnum {
  REPERTORIO = 'REPERTORIO',
  MANUAL = 'MANUAL',
}

export type ResponseEventoSetlistItemDto = {
  id: string;
  createdAt: string;
  updatedAt: string;
  eventoId: string;
  dataOcorrencia: string;
  ordem: number;
  tipoOrigem: EventoSetlistItemOrigemEnum;
  repertorioMusicaId?: string | null;
  nome: string;
  interprete?: string | null;
  versaoUrl?: string | null;
  tom?: string | null;
  bpm?: number | null;
  letraMarkdown?: string | null;
  cifraMarkdown?: string | null;
  observacoes?: string | null;
  hasEstruturaOverride?: boolean;
  totalSecoes?: number;
};
