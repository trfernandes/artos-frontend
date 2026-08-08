import {
  RecursoPermissaoEnum,
  TipoPermissaoEnum,
} from '../../enums/MinisterioVoluntarioPermissao/ministerio-voluntario-permissao.enum';

export type CreateMinisterioVoluntarioPermissaoDto = {
  ministerioVoluntarioId: string;
  recurso: RecursoPermissaoEnum;
  permissao?: TipoPermissaoEnum;
};
