export type UpdateRepertorioMusicaDto = Partial<{
  etiquetaIds: string[];
  nome: string;
  interprete: string;
  versaoUrl: string;
  tomOriginal: string;
  bpmOriginal: number;
  letraMarkdown: string;
  cifraMarkdown: string;
  observacoes: string;
  ativo: boolean;
}>;
