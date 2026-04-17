import { ResponseVoluntarioDto } from '../Voluntario/voluntario.response';
import { ResponseMinisterioFuncaoDto } from '../MinisterioFuncao/ministerio-funcao.response';

export type ResponseEquipeOcorrenciaIntegranteDto = {
  escalaItemId: string;
  voluntarioId?: string | null;
  voluntario?: ResponseVoluntarioDto | null;
  funcaoId?: string | null;
  funcao?: ResponseMinisterioFuncaoDto | null;
  status: string;
};

export type ResponseEquipeOcorrenciaGrupoDto = {
  funcaoId?: string | null;
  nomeFuncao: string;
  integrantes: ResponseEquipeOcorrenciaIntegranteDto[];
};

export type ResponseEquipeOcorrenciaDto = {
  eventoId: string;
  ministerioId?: string | null;
  dataOcorrencia: string;
  responsavelSetlistVoluntarioId?: string | null;
  responsavelSetlistVoluntario?: ResponseVoluntarioDto | null;
  grupos: ResponseEquipeOcorrenciaGrupoDto[];
};
