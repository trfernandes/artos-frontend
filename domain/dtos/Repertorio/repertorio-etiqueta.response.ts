export type ResponseRepertorioEtiquetaDto = {
  id: string;
  createdAt: string;
  updatedAt: string;
  igrejaId: string;
  ministerioId: string;
  nome: string;
  cor: string;
  ativo: boolean;
  totalMusicas?: number;
};
