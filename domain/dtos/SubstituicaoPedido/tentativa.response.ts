import type { ResponseEscalaItemDto } from '../Escala/escala-item.response';
import type { ResponseMinisterioVoluntarioDto } from '../MinisterioVoluntario/ministerio-voluntario.response';
import { EscalaSubstituicaoStatusEnum } from '../../enums/Escala/escala-substituicao-status.enum';
import { TentativaStatusEnum } from '../../enums/SubstituicaoPedido/tentativa-status.enum';

// Tentativa (ADR-0009) — mesma tabela/entidade legado `escala_substituicoes`,
// evoluída com os campos abaixo. `tentativaStatus` é o status novo; `status`
// legado ainda existe na entidade mas não é mais usado pelo fluxo Pedido/Tentativa.
export type ResponseTentativaDto = {
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
  dataResposta?: string | null;
  status: EscalaSubstituicaoStatusEnum;
  motivo: string;
  motivoCancelamento?: string | null;
  pedidoId: string;
  ordemFila?: number | null;
  prazoExpiracao?: string | null;
  dataOferecidaEmTroca?: string | null;
  tentativaStatus?: TentativaStatusEnum | null;
  notificadoPrazoExpirando?: boolean | null;
};
