import { EscalaItemStatusEnum } from '../../enums/Escala/escala-item-status.enum';

export type CreateEscalaItemDto = {
  escalaId: string;
  eventoId: string;
  dataOcorrencia: string;
  voluntarioId?: string;
  funcaoId?: string;
  status?: EscalaItemStatusEnum;
  substituicaoId?: string;
};
