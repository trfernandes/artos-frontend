import { BaseApiModel, BaseModel, ModelSerializer } from './BaseModel';
import { VoluntarioModel } from './Voluntario';

export interface MinisterioVoluntarioPermissaoModel extends BaseModel {
    ministerioVoluntarioId: string;
    ministerioVoluntario: VoluntarioModel;
    recurso: RecursoPermissaoEnum;
    permissoes?: TipoPermissaoEnum[];
}

export interface MinisterioVoluntarioPermissaoApiModel extends BaseApiModel {
    ministerioVoluntarioId: string;
    ministerioVoluntario?: VoluntarioModel;
    recurso: RecursoPermissaoEnum;
    permissoes: TipoPermissaoEnum[] | null;
}

export const MinisterioVoluntarioPermissaoSerializer: ModelSerializer<MinisterioVoluntarioPermissaoModel, MinisterioVoluntarioPermissaoApiModel> = {
    fromApi: (apiModel: MinisterioVoluntarioPermissaoApiModel): MinisterioVoluntarioPermissaoModel => ({}),
    toApi: (model: Partial<MinisterioVoluntarioPermissaoModel>): MinisterioVoluntarioPermissaoApiModel => ({}),
};

export enum RecursoPermissaoEnum {
    Ministerios = 1,
    Voluntarios = 2,
    Eventos = 3,
    Repertorio = 4,
}

export const RecursoPermissaoEnumMap: Record<number, RecursoPermissaoEnum> = {
    1: RecursoPermissaoEnum.Ministerios,
    2: RecursoPermissaoEnum.Voluntarios,
    3: RecursoPermissaoEnum.Eventos,
    4: RecursoPermissaoEnum.Repertorio,
};

export const RecursoPermissaoEnumLabel: Record<RecursoPermissaoEnum, string> = {
    [RecursoPermissaoEnum.Ministerios]: 'Ministérios',
    [RecursoPermissaoEnum.Voluntarios]: 'Voluntários',
    [RecursoPermissaoEnum.Eventos]: 'Eventos',
    [RecursoPermissaoEnum.Repertorio]: 'Repertório',
};

export enum TipoPermissaoEnum {
    Visualizar = 1,
    Incluir = 2,
    Alterar = 3,
    Remover = 4,
}

export const TipoPermissaoEnumMap: Record<number, TipoPermissaoEnum> = {
    1: TipoPermissaoEnum.Visualizar,
    2: TipoPermissaoEnum.Incluir,
    3: TipoPermissaoEnum.Alterar,
    4: TipoPermissaoEnum.Remover,
};

export const TipoPermissaoEnumLabel: Record<TipoPermissaoEnum, string> = {
    [TipoPermissaoEnum.Visualizar]: 'Visualizar',
    [TipoPermissaoEnum.Incluir]: 'Incluir',
    [TipoPermissaoEnum.Alterar]: 'Alterar',
    [TipoPermissaoEnum.Remover]: 'Remover',
};

export const RecursosPermissoesTable: Record<RecursoPermissaoEnum, TipoPermissaoEnum[]> = {
    [RecursoPermissaoEnum.Ministerios]: [TipoPermissaoEnum.Visualizar, TipoPermissaoEnum.Incluir, TipoPermissaoEnum.Alterar, TipoPermissaoEnum.Remover],
    [RecursoPermissaoEnum.Voluntarios]: [TipoPermissaoEnum.Visualizar, TipoPermissaoEnum.Incluir, TipoPermissaoEnum.Alterar, TipoPermissaoEnum.Remover],
    [RecursoPermissaoEnum.Eventos]: [TipoPermissaoEnum.Visualizar, TipoPermissaoEnum.Incluir, TipoPermissaoEnum.Alterar, TipoPermissaoEnum.Remover],
    [RecursoPermissaoEnum.Repertorio]: [TipoPermissaoEnum.Visualizar, TipoPermissaoEnum.Incluir, TipoPermissaoEnum.Alterar, TipoPermissaoEnum.Remover],
};
