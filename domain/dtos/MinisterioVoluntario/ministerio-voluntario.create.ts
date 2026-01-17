import { VoluntarioHierarquiaEnum } from '../../enums/MinisterioVoluntario/hierarquia.enum';

export type CreateMinisterioVoluntarioDto = {
  ministerioId: string;
  voluntarioId: string;
  hierarquia: VoluntarioHierarquiaEnum;
};
