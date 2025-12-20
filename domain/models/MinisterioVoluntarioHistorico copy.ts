import { Identifiable } from './Indentifiable';
import { HierarquiaEnum, MinisterioVoluntario, MinisterioVoluntarioStatusEnum } from './MinisterioVoluntario';

export interface MinisterioVoluntarioHistorico extends Identifiable {
  ministerioVoluntario: MinisterioVoluntario;
  ministerioVoluntarioId: string;
  status: MinisterioVoluntarioStatusEnum;
  hierarquia: HierarquiaEnum;
  dataInicio: Date;
  dataTermino?: Date;
}
