import { EscalaTemplateExperienciaEnum } from './EscalaTemplate';
import { Identifiable } from './Indentifiable';
import { MinisterioVoluntario } from './MinisterioVoluntario';
import { MinisterioVoluntarioFuncao, MinisterioVoluntarioFuncaoStatusEnum } from './MinisterioVoluntarioFuncao';

export interface MinisterioVoluntarioFuncaoHistorico extends Identifiable {
  ministerioVoluntario: MinisterioVoluntario;
  ministerioVoluntarioId: string;
  funcao: MinisterioVoluntarioFuncao;
  funcaoId: string;
  status: MinisterioVoluntarioFuncaoStatusEnum;
  experienciaNaEpoca?: EscalaTemplateExperienciaEnum | null;
  dataInicio: Date;
  dataTermino?: Date | null;
}
