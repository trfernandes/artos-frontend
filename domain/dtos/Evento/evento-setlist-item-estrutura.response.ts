import { RepertorioMusicaSecaoTipoEnum, ResponseRepertorioMusicaSecaoDto } from '../Repertorio/repertorio-musica-secao.response';

export type ResponseEventoSetlistItemEstruturaRowDto = {
  id: string;
  createdAt: string;
  updatedAt: string;
  eventoSetlistItemId: string;
  ordem: number;
  secaoRepertorioId?: string | null;
  secaoRepertorio?: ResponseRepertorioMusicaSecaoDto | null;
  rotulo: string;
  tipo?: RepertorioMusicaSecaoTipoEnum | null;
  letra?: string | null;
  cifra?: string | null;
  repeticoes: number;
  observacao?: string | null;
};

export type ResponseEventoSetlistItemEstruturaDto = {
  origem: 'REPERTORIO' | 'OCORRENCIA' | 'MANUAL';
  itens: ResponseEventoSetlistItemEstruturaRowDto[];
};
