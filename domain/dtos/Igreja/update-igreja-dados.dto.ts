export interface UpdateIgrejaDadosDto {
  nome: string;
  endereco: {
    cep: string;
    rua: string;
    numero: string;
    complemento?: string;
    cidade: string;
    uf: string;
  };
  telefone: string;
  email: string;
  logoUrl?: string;
}
