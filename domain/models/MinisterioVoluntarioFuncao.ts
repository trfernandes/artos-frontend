import { EscalaTemplateExperienciaEnum } from './EscalaTemplate';
import { BaseApiModel, BaseModel, ModelSerializer } from './BaseModel';
import { MinisterioFuncaoApiModel, MinisterioFuncaoModel, MinisterioFuncaoSerializer } from './MinisterioFuncao';
import { MinisterioVoluntarioApiModel, MinisterioVoluntarioModel, MinisterioVoluntarioSerializer } from './MinisterioVoluntario';

export interface MinisterioVoluntarioFuncaoModel extends BaseModel {
    ministerioVoluntarioId: string;
    ministerioVoluntario?: MinisterioVoluntarioModel;
    ministerioFuncaoId: string;
    ministerioFuncao?: MinisterioFuncaoModel;
    status: MinisterioVoluntarioFuncaoStatusEnum;
    experiencia: EscalaTemplateExperienciaEnum;
}

export interface MinisterioVoluntarioFuncaoApiModel extends BaseApiModel {
    ministerioVoluntarioId: string;
    ministerioVoluntario?: MinisterioVoluntarioApiModel | null;
    ministerioFuncaoId: string;
    ministerioFuncao?: MinisterioFuncaoApiModel | null;
    status: MinisterioVoluntarioFuncaoStatusEnum;
    experiencia: EscalaTemplateExperienciaEnum;
}

export const MinisterioVoluntarioFuncaoSerializer: ModelSerializer<MinisterioVoluntarioFuncaoModel, MinisterioVoluntarioFuncaoApiModel> = {
    fromApi: (apiModel: Partial<MinisterioVoluntarioFuncaoApiModel>): MinisterioVoluntarioFuncaoModel => ({
        id: apiModel.id,
        ministerioVoluntarioId: apiModel.ministerioVoluntarioId!,
        ministerioVoluntario: MinisterioVoluntarioSerializer.fromApi(apiModel.ministerioVoluntario!),
        ministerioFuncaoId: apiModel.ministerioFuncaoId!,
        ministerioFuncao: MinisterioFuncaoSerializer.fromApi(apiModel.ministerioFuncao!),
        status: apiModel.status!,
        experiencia: apiModel.experiencia!,
        createdAt: apiModel.createdAt,
        updatedAt: apiModel.updatedAt,
    }),
    toApi: (model: Partial<MinisterioVoluntarioFuncaoModel>): MinisterioVoluntarioFuncaoApiModel => ({
        id: model.id,
        ministerioVoluntarioId: model.ministerioVoluntarioId!,
        ministerioVoluntario: MinisterioVoluntarioSerializer.toApi(model.ministerioVoluntario!),
        ministerioFuncaoId: model.ministerioFuncaoId!,
        ministerioFuncao: MinisterioFuncaoSerializer.toApi(model.ministerioFuncao!),
        status: model.status!,
        experiencia: model.experiencia!,
        createdAt: model.createdAt,
        updatedAt: model.updatedAt,
    }),
};

export enum MinisterioVoluntarioFuncaoStatusEnum {
    Ativo = '0',
    Inativo = '1',
}

export const MinisterioVoluntarioFuncaoStatusEnumLabel: Record<MinisterioVoluntarioFuncaoStatusEnum, string> = {
    [MinisterioVoluntarioFuncaoStatusEnum.Ativo]: 'Ativo',
    [MinisterioVoluntarioFuncaoStatusEnum.Inativo]: 'Inativo',
};

export const MinisterioVoluntarioFuncaoStatusEnumMap: Record<string, MinisterioVoluntarioFuncaoStatusEnum> = {
    '0': MinisterioVoluntarioFuncaoStatusEnum.Ativo,
    '1': MinisterioVoluntarioFuncaoStatusEnum.Inativo,
};
