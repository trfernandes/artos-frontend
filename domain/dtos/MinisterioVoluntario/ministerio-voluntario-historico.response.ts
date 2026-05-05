import { VoluntarioHierarquiaEnum as MinisterioVoluntarioHierarquiaEnum } from '../../enums/MinisterioVoluntario/hierarquia.enum';
import { MinisterioVoluntarioStatusEnum } from '../../enums/MinisterioVoluntario/ministerio-voluntario-status.enum';
import { ResponseMinisterioVoluntarioDto } from './ministerio-voluntario.response';

export type ResponseMinisterioVoluntarioHistoricoDto = {
  ministerioVoluntarioId: string;
  ministerioVoluntario?: ResponseMinisterioVoluntarioDto;
  status: MinisterioVoluntarioStatusEnum;
  hierarquia: MinisterioVoluntarioHierarquiaEnum;
  dataInicio: string;
  dataTermino?: string;
};
