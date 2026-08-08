export enum RepertorioMusicaSecaoTipoEnum {
  INTRO = 'INTRO',
  ESTROFE = 'ESTROFE',
  PRE_REFRAO = 'PRE_REFRAO',
  REFRAO = 'REFRAO',
  PONTE = 'PONTE',
  SOLO = 'SOLO',
  INSTRUMENTAL = 'INSTRUMENTAL',
  FINAL = 'FINAL',
  PERSONALIZADO = 'PERSONALIZADO',
}

export type ResponseRepertorioMusicaSecaoDto = {
  id: string;
  createdAt: string;
  updatedAt: string;
  repertorioMusicaId: string;
  tipo: RepertorioMusicaSecaoTipoEnum;
  rotulo: string;
  letra?: string | null;
  cifra?: string | null;
  observacao?: string | null;
  ordem: number;
};
