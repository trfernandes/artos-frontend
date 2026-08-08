export type UpdateRepertorioMusicaDto = Partial<{
  categoriaId: string;
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
