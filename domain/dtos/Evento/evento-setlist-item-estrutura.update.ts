import { RepertorioMusicaSecaoTipoEnum } from '../Repertorio/repertorio-musica-secao.response';

export type UpsertEventoSetlistItemEstruturaRowDto = {
  ordem: number;
  secaoRepertorioId?: string | null;
  rotuloCustomizado?: string;
  tipo?: RepertorioMusicaSecaoTipoEnum;
  letraOverride?: string;
  cifraOverride?: string;
  repeticoes?: number;
  observacao?: string;
};

export type UpsertEventoSetlistItemEstruturaDto = {
  ministerioId: string;
  dataOcorrencia: string;
  itens: UpsertEventoSetlistItemEstruturaRowDto[];
};
