import type { ResponseEscalaSubstituicaoDto } from './escala-substituicao.response';
import type { ResponseEscalaDto } from './escala.response';
import { ResponseEventoDto } from '../Evento/evento.response';
import { ResponseMinisterioVoluntarioDto } from '../MinisterioVoluntario/ministerio-voluntario.response';
import { ResponseMinisterioFuncaoDto } from '../MinisterioFuncao/ministerio-funcao.response';
import { EscalaItemStatusEnum } from '../../enums/Escala/escala-item-status.enum';

export type ResponseEscalaItemDto = {
  id: string;
  createdAt: string;
  updatedAt: string;
  escalaId: string;
  escala?: ResponseEscalaDto;
  eventoId: string;
  evento?: ResponseEventoDto;
  dataOcorrencia: string;
  voluntarioId?: string;
  voluntario?: ResponseMinisterioVoluntarioDto;
  funcaoId?: string;
  funcao?: ResponseMinisterioFuncaoDto;
  status: EscalaItemStatusEnum;
  substituicaoId?: string;
  substituicao?: ResponseEscalaSubstituicaoDto;
};
