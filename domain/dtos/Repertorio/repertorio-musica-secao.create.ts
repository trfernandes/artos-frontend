import { RepertorioMusicaSecaoTipoEnum } from './repertorio-musica-secao.response';

export type CreateRepertorioMusicaSecaoDto = {
  tipo: RepertorioMusicaSecaoTipoEnum;
  rotulo: string;
  letra?: string;
  cifra?: string;
  observacao?: string;
  ordem: number;
};
