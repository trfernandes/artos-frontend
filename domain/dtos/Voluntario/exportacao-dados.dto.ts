export type ExportacaoDadosDto = {
  perfil: {
    id: string;
    nome: string;
    email: string;
    telefone: string | null;
    endereco: string | null;
    dataNascimento: string | null;
    sexo: string;
    status: string;
    politicaVersaoAceita: string | null;
    politicaAceitaEm: string | null;
    criadoEm: string;
  };
  vinculosMinisterio: {
    ministerio: string;
    hierarquia: string;
    status: string;
    dataInicio: string;
  }[];
  historicoEscalas: {
    evento: string | null;
    dataOcorrencia: string;
    funcao: string | null;
    status: string;
  }[];
};
