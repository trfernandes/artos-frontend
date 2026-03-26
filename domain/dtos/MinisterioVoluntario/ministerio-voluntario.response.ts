import { ResponseVoluntarioDto } from '../Voluntario/voluntario.response';
import { ResponseMinisterioDto } from '../Ministerio/ministerio.response';
import { ResponseMinisterioVoluntarioFuncaoDto } from '../MinisterioVoluntarioFuncao/ministerio-voluntario-funcao.response';
import { VoluntarioHierarquiaEnum } from '../../enums/MinisterioVoluntario/hierarquia.enum';
import { ResponseMinisterioVoluntarioHistoricoDto } from './ministerio-voluntario-historico.response';
import { ResponseMinisterioVoluntarioFuncaoHistDto } from '../MinisterioVoluntarioFuncao/ministerio-voluntario-funcao-hist.response';
import { MinisterioVoluntarioStatusEnum } from '../../enums/MinisterioVoluntario/ministerio-voluntario-status.enum';
import { ResponseMinisterioVoluntarioPermissaoDto } from '../MinisterioVoluntarioPermissao/ministerio-voluntario-permissao.response';

export type ResponseMinisterioVoluntarioDto = {
  id: string;
  createdAt: string;
  updatedAt: string;
  hierarquia: VoluntarioHierarquiaEnum;
  voluntarioId: string;
  voluntario?: ResponseVoluntarioDto;
  ministerioId: string;
  ministerio?: ResponseMinisterioDto;
  status: MinisterioVoluntarioStatusEnum;
  dataInicio: string;
  permissoes?: ResponseMinisterioVoluntarioPermissaoDto[];
  isDelegado?: boolean;
  funcoes?: ResponseMinisterioVoluntarioFuncaoDto[];
  historico?: ResponseMinisterioVoluntarioHistoricoDto[];
  historicoFuncoes?: ResponseMinisterioVoluntarioFuncaoHistDto[];
};
