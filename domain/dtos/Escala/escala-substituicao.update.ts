import { EscalaSubstituicaoStatusEnum } from '../../enums/Escala/escala-substituicao-status.enum';
import type { CreateEscalaSubstituicaoDto } from './escala-substituicao.create';

export type UpdateEscalaSubstituicaoDto = Partial<CreateEscalaSubstituicaoDto> & {
  status?: EscalaSubstituicaoStatusEnum;
  dataConfirmacao?: string;
  dataResposta?: string;
  motivoCancelamento?: string;
};
