export type PoliticaPrivacidadeSecaoDto = {
  titulo: string;
  corpo: string;
};

export type ResponsePoliticaPrivacidadeDto = {
  versao: string;
  secoes: PoliticaPrivacidadeSecaoDto[];
};
