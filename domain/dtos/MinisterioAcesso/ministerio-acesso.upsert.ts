import {
  RecursoPermissaoEnum,
  TipoPermissaoEnum,
} from '../../enums/MinisterioVoluntarioPermissao/ministerio-voluntario-permissao.enum';

export type UpsertMinisterioAuxiliarPermissaoDto = {
  recurso: RecursoPermissaoEnum;
  permissoes: TipoPermissaoEnum[];
};

export type UpsertMinisterioAuxiliarDto = {
  voluntarioId: string;
  permissoes: UpsertMinisterioAuxiliarPermissaoDto[];
};
