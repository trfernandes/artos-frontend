import { BaseModel, BaseApiModel, ModelSerializer } from './BaseModel';
import { EscalaTemplateExperienciaEnum } from './EscalaTemplate';
import { MinisterioFuncaoModel, MinisterioFuncaoApiModel, MinisterioFuncaoSerializer } from './MinisterioFuncao';

export interface EscalaTemplateFuncaoModel extends BaseModel {
    funcaoId: string;
    funcao?: MinisterioFuncaoModel;
    experiencia: EscalaTemplateExperienciaEnum;
    quantidade: number;
}

export interface EscalaTemplateFuncaoApiModel extends BaseApiModel {
    funcaoId: string;
    funcao?: MinisterioFuncaoApiModel | null;
    experiencia: EscalaTemplateExperienciaEnum;
    quantidade: number;
}

export const EscalaTemplateFuncaoSerializer: ModelSerializer<EscalaTemplateFuncaoModel, EscalaTemplateFuncaoApiModel> = {
    fromApi: (apiModel: Partial<EscalaTemplateFuncaoApiModel>): EscalaTemplateFuncaoModel => ({
        id: apiModel.id,
        funcaoId: apiModel.funcaoId!,
        funcao: MinisterioFuncaoSerializer.fromApi(apiModel.funcao!),
        experiencia: apiModel.experiencia!,
        quantidade: apiModel.quantidade!,
        createdAt: apiModel.createdAt,
        updatedAt: apiModel.updatedAt,
    }),
    toApi: (model: Partial<EscalaTemplateFuncaoModel>): EscalaTemplateFuncaoApiModel => ({
        id: model.id,
        funcaoId: model.funcaoId!,
        funcao: MinisterioFuncaoSerializer.toApi(model.funcao!),
        experiencia: model.experiencia!,
        quantidade: model.quantidade!,
        createdAt: model.createdAt,
        updatedAt: model.updatedAt,
    }),
};
