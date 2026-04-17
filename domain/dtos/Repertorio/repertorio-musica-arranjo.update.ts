export type UpsertRepertorioMusicaArranjoItemDto = {
  secaoId: string;
  ordem: number;
  repeticoes?: number;
  observacao?: string;
};

export type UpsertRepertorioMusicaArranjoDto = {
  itens: UpsertRepertorioMusicaArranjoItemDto[];
};
