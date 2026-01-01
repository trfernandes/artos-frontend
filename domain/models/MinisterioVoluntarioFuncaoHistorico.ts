import { EscalaTemplateExperienciaEnum } from './EscalaTemplate';
import { BaseApiModel, BaseModel, ModelSerializer } from './BaseModel';
import { MinisterioVoluntarioApiModel, MinisterioVoluntarioModel, MinisterioVoluntarioSerializer } from './MinisterioVoluntario';
import {
     MinisterioVoluntarioFuncaoModel,
     MinisterioVoluntarioFuncaoApiModel,
     MinisterioVoluntarioFuncaoStatusEnum,
     MinisterioVoluntarioFuncaoSerializer,
} from './MinisterioVoluntarioFuncao';
import { DateUtilsApi } from '../../utils/date_utils';

export interface MinisterioVoluntarioFuncaoHistoricoModel extends BaseModel {
    ministerioVoluntarioId: string;
    ministerioVoluntario: MinisterioVoluntarioModel;
    ministerioFuncaoId: string;
    ministerioFuncao?: MinisterioVoluntarioFuncaoModel;
    status: MinisterioVoluntarioFuncaoStatusEnum;
    experienciaNaEpoca?: EscalaTemplateExperienciaEnum | null;
    dataInicio: Date;
    dataTermino?: Date;
}

export interface MinisterioVoluntarioFuncaoHistoricoApiModel extends BaseApiModel {
    ministerioVoluntarioId: string;
    ministerioVoluntario: MinisterioVoluntarioApiModel;
    ministerioFuncaoId: string;
    ministerioFuncao?: MinisterioVoluntarioFuncaoApiModel;
    status: MinisterioVoluntarioFuncaoStatusEnum;
    experienciaNaEpoca?: EscalaTemplateExperienciaEnum | null;
    dataInicio: string;
    dataTermino?: string | null;
}

export const MinisterioVoluntarioFuncaoHistoricoSerializer: ModelSerializer<
    MinisterioVoluntarioFuncaoHistoricoModel,
    MinisterioVoluntarioFuncaoHistoricoApiModel
> = {
    fromApi: (apiModel: Partial<MinisterioVoluntarioFuncaoHistoricoApiModel>): MinisterioVoluntarioFuncaoHistoricoModel => ({
        id: apiModel.id,
        ministerioVoluntarioId: apiModel.ministerioVoluntarioId!,
        ministerioVoluntario: MinisterioVoluntarioSerializer.fromApi(apiModel.ministerioVoluntario!),
        ministerioFuncaoId: apiModel.ministerioFuncaoId!,
        ministerioFuncao: MinisterioVoluntarioFuncaoSerializer.fromApi(apiModel.ministerioFuncao!),
        status: apiModel.status!,
        experienciaNaEpoca: apiModel.experienciaNaEpoca ?? null,
        dataInicio: DateUtilsApi.dateOnlyFromApi(apiModel.dataInicio!),
        dataTermino: apiModel.dataTermino ? DateUtilsApi.dateOnlyFromApi(apiModel.dataTermino) : undefined,
    }),
    toApi: (model: Partial<MinisterioVoluntarioFuncaoHistoricoModel>): MinisterioVoluntarioFuncaoHistoricoApiModel => ({
        id: model.id,
        ministerioVoluntarioId: model.ministerioVoluntarioId!,
        ministerioVoluntario: MinisterioVoluntarioSerializer.toApi(model.ministerioVoluntario!),
        ministerioFuncaoId: model.ministerioFuncaoId!,
        ministerioFuncao: MinisterioVoluntarioFuncaoSerializer.toApi(model.ministerioFuncao!),
        status: model.status!,
        experienciaNaEpoca: model.experienciaNaEpoca ?? null,
        dataInicio: DateUtilsApi.dateOnlyToApi(model.dataInicio!),
        dataTermino: model.dataTermino ? DateUtilsApi.dateOnlyToApi(model.dataTermino) : null,
    }),
};
