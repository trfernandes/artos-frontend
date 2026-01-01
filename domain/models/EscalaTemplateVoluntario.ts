import { BaseModel, BaseApiModel, ModelSerializer } from './BaseModel';
import { MinisterioFuncaoModel, MinisterioFuncaoApiModel, MinisterioFuncaoSerializer } from './MinisterioFuncao';
import { MinisterioVoluntarioModel, MinisterioVoluntarioApiModel, MinisterioVoluntarioSerializer } from './MinisterioVoluntario';

export interface EscalaTemplateVoluntarioModel extends BaseModel {
    voluntarioId: string;
    voluntario?: MinisterioVoluntarioModel;
    funcaoId: string;
    funcao?: MinisterioFuncaoModel;
}

export interface EscalaTemplateVoluntarioApiModel extends BaseApiModel {
    voluntarioId: string;
    voluntario?: MinisterioVoluntarioApiModel | null;
    funcaoId: string;
    funcao?: MinisterioFuncaoApiModel | null;
}

export const EscalaTemplateVoluntarioSerializer: ModelSerializer<EscalaTemplateVoluntarioModel, EscalaTemplateVoluntarioApiModel> = {
    fromApi: (apiModel: Partial<EscalaTemplateVoluntarioApiModel>): EscalaTemplateVoluntarioModel => ({
        id: apiModel.id,
        funcaoId: apiModel.funcaoId!,
        funcao: apiModel.funcao ? MinisterioFuncaoSerializer.fromApi(apiModel.funcao) : undefined,
        voluntarioId: apiModel.voluntarioId!,
        voluntario: apiModel.voluntario ? MinisterioVoluntarioSerializer.fromApi(apiModel.voluntario) : undefined,
        createdAt: apiModel.createdAt,
        updatedAt: apiModel.updatedAt,
    }),
    toApi: (model: Partial<EscalaTemplateVoluntarioModel>): EscalaTemplateVoluntarioApiModel => ({
        id: model.id,
        funcaoId: model.funcaoId!,
        funcao: MinisterioFuncaoSerializer.toApi(model.funcao!),
        voluntarioId: model.voluntarioId!,
        voluntario: MinisterioVoluntarioSerializer.toApi(model.voluntario!),
        createdAt: model.createdAt,
        updatedAt: model.updatedAt,
    }),
};
