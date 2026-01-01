import { DateUtilsApi } from '../../utils/date_utils';
import { BaseApiModel, BaseModel, ModelSerializer } from './BaseModel';
import { MinisterioApiModel, MinisterioModel, MinisterioSerializer } from './Ministerio';
import { MinisterioVoluntarioFuncaoModel, MinisterioVoluntarioFuncaoApiModel, MinisterioVoluntarioFuncaoSerializer } from './MinisterioVoluntarioFuncao';
import {
     MinisterioVoluntarioFuncaoHistoricoModel,
     MinisterioVoluntarioFuncaoHistoricoApiModel,
     MinisterioVoluntarioFuncaoHistoricoSerializer,
} from './MinisterioVoluntarioFuncaoHistorico';
import {
     MinisterioVoluntarioHistoricoModel,
     MinisterioVoluntarioHistoricoApiModel,
     MinisterioVoluntarioHistoricoSerializer,
} from './MinisterioVoluntarioHistorico';
import { VoluntarioApiModel, VoluntarioModel, VoluntarioSerializer } from './Voluntario';

export interface MinisterioVoluntarioModel extends BaseModel {
    ministerioId: number;
    ministerio?: Partial<MinisterioModel>;
    voluntarioId?: number;
    voluntario?: Partial<VoluntarioModel>;
    hierarquia: HierarquiaEnum;
    funcoes?: MinisterioVoluntarioFuncaoModel[];
    status: MinisterioVoluntarioStatusEnum;
    dataInicio: Date;
    historico?: MinisterioVoluntarioHistoricoModel[];
    historicoFuncoes?: MinisterioVoluntarioFuncaoHistoricoModel[];
}

export interface MinisterioVoluntarioApiModel extends BaseApiModel {
    ministerioId: number;
    ministerio: MinisterioApiModel;
    voluntarioId?: number;
    voluntario: VoluntarioApiModel;
    hierarquia: HierarquiaEnum;
    funcoes: MinisterioVoluntarioFuncaoApiModel[] | null;
    status: MinisterioVoluntarioStatusEnum;
    dataInicio: string;
    historico: MinisterioVoluntarioHistoricoApiModel[] | null;
    historicoFuncoes: MinisterioVoluntarioFuncaoHistoricoApiModel[] | null;
}

export const MinisterioVoluntarioSerializer: ModelSerializer<MinisterioVoluntarioModel, MinisterioVoluntarioApiModel> = {
    fromApi: (apiModel: Partial<MinisterioVoluntarioApiModel>): MinisterioVoluntarioModel => ({
        id: apiModel.id,
        ministerioId: apiModel.ministerioId!,
        ministerio: MinisterioSerializer.fromApi(apiModel.ministerio!),
        voluntario: VoluntarioSerializer.fromApi(apiModel.voluntario!),
        hierarquia: apiModel.hierarquia!,
        status: apiModel.status!,
        dataInicio: DateUtilsApi.dateOnlyFromApi(apiModel.dataInicio!),
        funcoes: apiModel.funcoes ? apiModel.funcoes.map(MinisterioVoluntarioFuncaoSerializer.fromApi) : undefined,
        historico: apiModel.historico ? apiModel.historico.map(MinisterioVoluntarioHistoricoSerializer.fromApi) : undefined,
        historicoFuncoes: apiModel.historicoFuncoes
            ? apiModel.historicoFuncoes.map((item) => MinisterioVoluntarioFuncaoHistoricoSerializer.fromApi(item))
            : undefined,
        createdAt: apiModel.createdAt,
        updatedAt: apiModel.updatedAt,
    }),
    toApi: (model: Partial<MinisterioVoluntarioModel>): MinisterioVoluntarioApiModel => ({
        id: model.id,
        ministerioId: model.ministerioId!,
        ministerio: MinisterioSerializer.toApi(model.ministerio!),
        voluntario: VoluntarioSerializer.toApi(model.voluntario!),
        hierarquia: model.hierarquia!,
        status: model.status!,
        dataInicio: DateUtilsApi.dateOnlyToApi(model.dataInicio!),
        funcoes: model.funcoes ? model.funcoes.map(MinisterioVoluntarioFuncaoSerializer.toApi) : null,
        historico: model.historico ? model.historico.map(MinisterioVoluntarioHistoricoSerializer.toApi) : null,
        historicoFuncoes: model.historicoFuncoes ? model.historicoFuncoes.map((item) => MinisterioVoluntarioFuncaoHistoricoSerializer.toApi(item)) : null,
    }),
};

export enum MinisterioVoluntarioStatusEnum {
    Ativo = '0',
    Inativo = '1',
}

export const MinisterioVoluntarioStatusEnumLabel: Record<MinisterioVoluntarioStatusEnum, string> = {
    [MinisterioVoluntarioStatusEnum.Ativo]: 'Ativo',
    [MinisterioVoluntarioStatusEnum.Inativo]: 'Inativo',
};

export const MinisterioVoluntarioStatusEnumMap: Record<string, MinisterioVoluntarioStatusEnum> = {
    '0': MinisterioVoluntarioStatusEnum.Ativo,
    '1': MinisterioVoluntarioStatusEnum.Inativo,
};

export enum HierarquiaEnum {
    Voluntario = 0,
    Lider = 1,
    Auxiliar = 2,
}

export const HierarquiaEnumLabel: Record<HierarquiaEnum, string> = {
    [HierarquiaEnum.Voluntario]: 'Voluntário',
    [HierarquiaEnum.Lider]: 'Líder',
    [HierarquiaEnum.Auxiliar]: 'Auxiliar',
};

export const HierarquiaEnumMap: Record<number, HierarquiaEnum> = {
    0: HierarquiaEnum.Voluntario,
    1: HierarquiaEnum.Lider,
    2: HierarquiaEnum.Auxiliar,
};
