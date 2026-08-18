import { EventoSetlistItemOrigemEnum } from './evento-setlist-item.response';

export type GetMusicasTocadasRelatorioParams = {
  ministerioId: string;
  dataInicio?: string;
  dataFim?: string;
  categoriaId?: string;
  eventoId?: string;
  dataOcorrencia?: string;
};

export type ResponseMusicaTocadaExecucaoDto = {
  dataOcorrencia: string;
  eventoId: string;
};

export type ResponseMusicaTocadaDto = {
  id: string;
  origem: EventoSetlistItemOrigemEnum;
  repertorioMusicaId: string | null;
  nome: string;
  interprete: string | null;
  categoriaId: string | null;
  categoriaNome: string | null;
  totalExecucoes: number;
  ultimaExecucaoEm: string | null;
  execucoes: ResponseMusicaTocadaExecucaoDto[];
};

export type ResponseMusicasTocadasRelatorioDto = {
  totalExecucoes: number;
  totalMusicasDistintas: number;
  musicaTopId: string | null;
  musicaTopNome: string | null;
  percentualNuncaTocado: number;
  musicas: ResponseMusicaTocadaDto[];
};
