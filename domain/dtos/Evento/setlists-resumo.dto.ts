import { ResponseVoluntarioDto } from '../Voluntario/voluntario.response';

export type GetSetlistsResumoParams = {
  dataInicio?: string;
  dataFim?: string;
};

export type ResponseSetlistResumoDto = {
  eventoId: string;
  nome: string;
  dataOcorrencia: string;
  responsavelSetlistVoluntario?: ResponseVoluntarioDto | null;
  totalMusicas: number;
  cancelada: boolean;
};
