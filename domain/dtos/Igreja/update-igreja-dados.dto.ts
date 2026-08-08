export interface UpdateIgrejaDadosDto {
  nome?: string;
  endereco?: {
    cep?: string;
    rua?: string;
    numero?: string;
    bairro?: string;
    complemento?: string;
    cidade?: string;
    uf?: string;
  };
  telefone?: string;
  email?: string;
  logoUrl?: string;
  faturamento?: {
    cnpj: string;
    telefoneCobranca: string;
    emailCobranca?: string;
    cep: string;
    rua: string;
    numero: string;
    bairro: string;
    cidade: string;
    cidadeIbge?: string;
    uf: string;
    complemento?: string;
  };
}
