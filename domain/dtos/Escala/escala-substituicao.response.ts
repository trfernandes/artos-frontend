import type { ResponseEscalaItemDto } from './escala-item.response';
import type { ResponseMinisterioVoluntarioDto } from '../MinisterioVoluntario/ministerio-voluntario.response';
import { EscalaSubstituicaoStatusEnum } from '../../enums/Escala/escala-substituicao-status.enum';

export type ResponseEscalaSubstituicaoDto = {
  id: string;
  createdAt: string;
  updatedAt: string;
  escalaItemId: string;
  escalaItem?: ResponseEscalaItemDto;
  solicitanteId: string;
  solicitante?: ResponseMinisterioVoluntarioDto;
  substitutoId: string;
  substituto?: ResponseMinisterioVoluntarioDto;
  dataSolicitacao: string;
  dataResposta?: string;
  dataConfirmacao?: string;
  status: EscalaSubstituicaoStatusEnum;
  motivo: string;
  motivoCancelamento?: string | null;
};
