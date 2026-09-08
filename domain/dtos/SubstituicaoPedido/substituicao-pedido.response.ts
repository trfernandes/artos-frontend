import type { ResponseEscalaItemDto } from '../Escala/escala-item.response';
import type { ResponseMinisterioVoluntarioDto } from '../MinisterioVoluntario/ministerio-voluntario.response';
import { SubstituicaoPedidoStatusEnum } from '../../enums/SubstituicaoPedido/substituicao-pedido-status.enum';
import type { ResponseTentativaDto } from './tentativa.response';

export type ResponseSubstituicaoPedidoDto = {
  id: string;
  createdAt: string;
  updatedAt: string;
  escalaItemId: string;
  escalaItem?: ResponseEscalaItemDto;
  solicitanteId: string;
  solicitante?: ResponseMinisterioVoluntarioDto;
  status: SubstituicaoPedidoStatusEnum;
  dataResolucao?: string | null;
  motivoCancelamento?: string | null;
  pedidoOrigemTrocaId?: string | null;
  tentativas?: ResponseTentativaDto[];
};

// Retorno de GET /meus-pedidos e GET /lider/pendentes — Pedido + indicador de "sua vez".
export type PedidoComPendencia = {
  pedido: ResponseSubstituicaoPedidoDto;
  aguardandoAcaoDoUsuario: boolean;
  papel?: string;
};
