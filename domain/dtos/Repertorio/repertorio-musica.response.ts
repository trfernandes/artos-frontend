import { ResponseRepertorioCategoriaDto } from './repertorio-categoria.response';

export type ResponseRepertorioMusicaDto = {
  id: string;
  createdAt: string;
  updatedAt: string;
  igrejaId: string;
  ministerioId: string;
  categoriaId: string;
  categoria?: ResponseRepertorioCategoriaDto;
  nome: string;
  interprete?: string | null;
  versaoUrl?: string | null;
  tomOriginal?: string | null;
  bpmOriginal?: number | null;
  letraMarkdown?: string | null;
  cifraMarkdown?: string | null;
  observacoes?: string | null;
  ativo: boolean;
};
