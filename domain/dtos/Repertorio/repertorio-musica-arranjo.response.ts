import { ResponseRepertorioMusicaSecaoDto } from './repertorio-musica-secao.response';

export type ResponseRepertorioMusicaArranjoDto = {
  id: string;
  createdAt: string;
  updatedAt: string;
  repertorioMusicaId: string;
  secaoId: string;
  secao?: ResponseRepertorioMusicaSecaoDto | null;
  ordem: number;
  repeticoes: number;
  observacao?: string | null;
};
