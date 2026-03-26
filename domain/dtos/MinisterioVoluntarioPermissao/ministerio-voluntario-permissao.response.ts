import {
  RecursoPermissaoEnum,
  TipoPermissaoEnum,
} from '../../enums/MinisterioVoluntarioPermissao/ministerio-voluntario-permissao.enum';

export type ResponseMinisterioVoluntarioPermissaoDto = {
  id?: string;
  createdAt?: string;
  updatedAt?: string;
  ministerioVoluntarioId?: string;
  recurso: RecursoPermissaoEnum;
  permissoes: TipoPermissaoEnum[];
};
