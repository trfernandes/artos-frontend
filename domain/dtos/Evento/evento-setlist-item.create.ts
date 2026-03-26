import { EventoSetlistItemOrigemEnum } from './evento-setlist-item.response';

export type CreateEventoSetlistItemDto = {
  dataOcorrencia: string;
  tipoOrigem: EventoSetlistItemOrigemEnum;
  repertorioMusicaId?: string | null;
  ordem?: number;
  nome: string;
  interprete?: string;
  versaoUrl?: string;
  tom?: string;
  bpm?: number;
  letraMarkdown?: string;
  cifraMarkdown?: string;
  observacoes?: string;
};
