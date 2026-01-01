import { BaseApiModel, BaseModel, ModelSerializer } from './BaseModel';
import { MinisterioApiModel, MinisterioModel, MinisterioSerializer } from './Ministerio';

export interface MinisterioFuncaoModel extends BaseModel {
    ministerioId: string;
    ministerio?: MinisterioModel;
    nome: string;
    descricao?: string;
    status: MinisterioFuncaoStatusEnum;
}

export interface MinisterioFuncaoApiModel extends BaseApiModel {
    ministerioId: string;
    ministerio?: MinisterioApiModel | null;
    nome: string;
    descricao: string | null;
    status: MinisterioFuncaoStatusEnum;
}

export const MinisterioFuncaoSerializer: ModelSerializer<MinisterioFuncaoModel, MinisterioFuncaoApiModel> = {
    fromApi: (apiModel: Partial<MinisterioFuncaoApiModel>): MinisterioFuncaoModel => ({
        id: apiModel.id,
        ministerioId: apiModel.ministerioId!,
        ministerio: apiModel.ministerio ? MinisterioSerializer.fromApi(apiModel.ministerio) : undefined,
        nome: apiModel.nome!,
        descricao: apiModel.descricao ?? undefined,
        status: apiModel.status!,
        createdAt: apiModel.createdAt,
        updatedAt: apiModel.updatedAt,
    }),
    toApi: (model: Partial<MinisterioFuncaoModel>): MinisterioFuncaoApiModel => ({
        id: model.id,
        ministerio: model.ministerio && MinisterioSerializer.toApi(model.ministerio),
        ministerioId: model.ministerioId!,
        nome: model.nome!,
        descricao: model.descricao ?? null,
        status: model.status!,
    }),
};

export enum MinisterioFuncaoStatusEnum {
    Ativo = '0',
    Inativo = '1',
}

export const MinisterioFuncaoStatusEnumMap: Record<number, MinisterioFuncaoStatusEnum> = {
    0: MinisterioFuncaoStatusEnum.Ativo,
    1: MinisterioFuncaoStatusEnum.Inativo,
};

export const MinisterioFuncaoStatusEnumLabel: Record<MinisterioFuncaoStatusEnum, string> = {
    [MinisterioFuncaoStatusEnum.Ativo]: 'Ativo',
    [MinisterioFuncaoStatusEnum.Inativo]: 'Inativo',
};
