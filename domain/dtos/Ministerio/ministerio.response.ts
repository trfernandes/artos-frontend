import { MinisterioStatusEnum } from '../../enums/Ministerio/ministerio-status.enum';
import { MinisterioTipoEnum } from '../../enums/Ministerio/ministerio-tipo.enum';
import { ResponseIgrejaDto } from '../Igreja/response-igreja.dto';
import { ResponseMinisterioFuncaoDto } from '../MinisterioFuncao/ministerio-funcao.response';
import { ResponseMinisterioVoluntarioDto } from '../MinisterioVoluntario/ministerio-voluntario.response';

export type ResponseMinisterioDto = {
  id: string;
  createdAt: string;
  updatedAt: string;
  igrejaId: string;
  igreja?: ResponseIgrejaDto;
  nome: string;
  descricao?: string;
  tipo: MinisterioTipoEnum;
  status: MinisterioStatusEnum;
  voluntarios: ResponseMinisterioVoluntarioDto[];
  funcoes: ResponseMinisterioFuncaoDto[];
  logoUrl?: string;
  logoThumbUrl?: string;
};
