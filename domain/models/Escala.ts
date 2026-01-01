import { EscalaItemApiModel, EscalaItemModel, EscalaItemSerializer } from './EscalaItem';
import { BaseApiModel, BaseModel, ModelSerializer } from './BaseModel';
import { MinisterioApiModel, MinisterioModel, MinisterioSerializer } from './Ministerio';
import { DateUtilsApi } from '../../utils/date_utils';
import { ApiUtils } from '../../utils/apiUtils';

export enum EscalaStatusEnum {
    Gerada = '1',
    Publicada = '2',
    Concluida = '3',
}

export const EscalaStatusEnumLabel: Record<EscalaStatusEnum, string> = {
    [EscalaStatusEnum.Gerada]: 'Gerada',
    [EscalaStatusEnum.Publicada]: 'Publicada',
    [EscalaStatusEnum.Concluida]: 'Concluída',
};

export interface EscalaModel extends BaseModel {
    ministerioId: string;
    ministerio?: MinisterioModel;
    dataInicio: Date;
    dataTermino: Date;
    nome: string;
    status: EscalaStatusEnum;
    parametrizacao: {
        eventos: Array<{
            id: string;
            date: string;
            name: string;
            equipe: {
                id: string;
                tipo: string;
                funcoes: Array<{ id: string; nome: string; expMinima: string }>;
                fixos: Array<{ voluntarioId: string; funcaoId: string }>;
            };
        }>;
        participantes: Array<{ id: string; name: string }>;
    };
    itens?: EscalaItemModel[];
}

export interface EscalaApiModel extends BaseApiModel {
    ministerioId: string;
    ministerio?: MinisterioApiModel | null;
    dataInicio: string;
    dataTermino: string;
    nome: string;
    status: EscalaStatusEnum;
    parametrizacao: string;
    itens?: EscalaItemApiModel[] | null;
}

export const EscalaSerializer: ModelSerializer<EscalaModel, EscalaApiModel> = {
    fromApi: (apiModel: Partial<EscalaApiModel>): EscalaModel => {
        return {
            id: apiModel.id,
            nome: apiModel.nome!,
            ministerioId: apiModel.ministerioId!,
            ministerio: apiModel.ministerio ? MinisterioSerializer.fromApi(apiModel.ministerio) : undefined,
            dataInicio: DateUtilsApi.dateOnlyFromApi(apiModel.dataInicio!),
            dataTermino: DateUtilsApi.dateOnlyFromApi(apiModel.dataTermino!),
            parametrizacao: JSON.parse(apiModel.parametrizacao!),
            status: apiModel.status!,
            itens: apiModel.itens?.map((item) => EscalaItemSerializer.fromApi(item)) || [],
            createdAt: apiModel.createdAt,
            updatedAt: apiModel.updatedAt,
        };
    },

    toApi: (model: Partial<EscalaModel>): EscalaApiModel => {
        return {
            id: model.id,
            dataInicio: ApiUtils.normalizeOptionalDataToApi(DateUtilsApi.dateOnlyToApi(model.dataInicio!)),
            dataTermino: ApiUtils.normalizeOptionalDataToApi(DateUtilsApi.dateOnlyToApi(model.dataTermino!)),
            nome: model.nome!,
            ministerio: ApiUtils.normalizeOptionalDataToApi(MinisterioSerializer.toApi(model.ministerio!)),
            ministerioId: model.ministerioId!,
            status: model.status!,
            parametrizacao: ApiUtils.normalizeOptionalDataToApi(JSON.stringify(model?.parametrizacao)),
            itens: ApiUtils.normalizeOptionalDataToApi(model.itens ? model.itens.map((item) => EscalaItemSerializer.toApi(item)) : []),
            createdAt: model.createdAt,
            updatedAt: model.updatedAt,
        };
    },
};
