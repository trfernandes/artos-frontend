import { EscalaStatusEnum } from '../../enums/Escala/escala-status.enum';
import { EscalaOrigemEnum } from '../../enums/Escala/escala-origem.enum';
import { ResponseMinisterioDto } from '../Ministerio/ministerio.response';
import type { ResponseEscalaItemDto } from './escala-item.response';

export type EscalaParametrizacaoType = {
  eventos: Array<{
    id: string;
    date: string;
    name: string;
    equipe: {
      id: string;
      tipo: string;
      funcoes: Array<{ id: string; nome: string; quantidade?: number; expMinima: string }>;
      fixos: Array<{ voluntarioId: string; funcaoId: string; name?: string }>;
    };
  }>;
  participantes: Array<{ id: string; name: string }>;
};

export type ResponseEscalaDto = {
  id: string;
  createdAt: string;
  updatedAt: string;
  ministerioId: string;
  ministerio?: ResponseMinisterioDto;
  dataInicio: string;
  dataTermino: string;
  nome: string;
  status: EscalaStatusEnum;
  origem: EscalaOrigemEnum;
  parametrizacao?: string;
  itens: ResponseEscalaItemDto[];
};
