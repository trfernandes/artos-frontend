// DTO para criação de igreja via endpoint público
// POST /public/cadastro-igreja
export type CreateCadastroIgrejaPublicoDto = {
  igrejaNome: string;
  igrejaCidade?: string | null;
  igrejaUf?: string | null;
  igrejaCodigo?: string | null;
  responsavelNome: string;
  responsavelEmail: string;
  responsavelSenha: string;
};

// Mantém o tipo antigo para compatibilidade (deprecated)
/** @deprecated Use CreateCadastroIgrejaPublicoDto */
export type CreateIgrejaPublicoDto = {
  nome: string;
  cidade?: string | null;
  uf?: string | null;
  codigo: string;
  responsavelNome: string;
  responsavelEmail: string;
  responsavelSenha: string;
  responsavelWhatsapp: string;
};
