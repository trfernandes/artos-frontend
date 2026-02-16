export type ResponseEscalaNomeConflitoDto = {
  id: string;
  nome: string;
  status?: string | null;
};

export type ResponseEscalaValidarNomeDto = {
  exists: boolean;
  normalizedNome: string;
  conflito: ResponseEscalaNomeConflitoDto | null;
};
