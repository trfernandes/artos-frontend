import { DateUtilsApi } from '../../utils/date_utils';
import { BaseModel, ModelSerializer } from './BaseModel';
import {
     HierarquiaEnum,
     MinisterioVoluntarioApiModel,
     MinisterioVoluntarioModel,
     MinisterioVoluntarioSerializer,
     MinisterioVoluntarioStatusEnum,
} from './MinisterioVoluntario';

export interface MinisterioVoluntarioHistoricoModel extends BaseModel {
    ministerioVoluntarioId: string;
    ministerioVoluntario?: MinisterioVoluntarioModel;
    status: MinisterioVoluntarioStatusEnum;
    hierarquia: HierarquiaEnum;
    dataInicio: Date;
    dataTermino?: Date;
}

export interface MinisterioVoluntarioHistoricoApiModel extends BaseModel {
    ministerioVoluntarioId: string;
    ministerioVoluntario?: MinisterioVoluntarioApiModel;
    status: MinisterioVoluntarioStatusEnum;
    hierarquia: HierarquiaEnum;
    dataInicio: string;
    dataTermino: string | null;
}

export const MinisterioVoluntarioHistoricoSerializer: ModelSerializer<MinisterioVoluntarioHistoricoModel, MinisterioVoluntarioHistoricoApiModel> = {
    fromApi: (apiModel: Partial<MinisterioVoluntarioHistoricoApiModel>): MinisterioVoluntarioHistoricoModel => ({
        id: apiModel.id,
        createdAt: apiModel.createdAt ? new Date(apiModel.createdAt) : undefined,
        updatedAt: apiModel.updatedAt ? new Date(apiModel.updatedAt) : undefined,
        ministerioVoluntarioId: apiModel.ministerioVoluntarioId!,
        ministerioVoluntario: MinisterioVoluntarioSerializer.fromApi(apiModel.ministerioVoluntario!),
        status: apiModel.status!,
        hierarquia: apiModel.hierarquia!,
        dataInicio: DateUtilsApi.dateOnlyFromApi(apiModel.dataInicio!),
        dataTermino: apiModel.dataTermino ? DateUtilsApi.dateOnlyFromApi(apiModel.dataTermino) : undefined,
    }),
    toApi: (model: Partial<MinisterioVoluntarioHistoricoModel>): MinisterioVoluntarioHistoricoApiModel => ({
        id: model.id,
        createdAt: model.createdAt,
        updatedAt: model.updatedAt,
        ministerioVoluntarioId: model.ministerioVoluntarioId!,
        ministerioVoluntario: MinisterioVoluntarioSerializer.toApi(model.ministerioVoluntario!),
        status: model.status!,
        hierarquia: model.hierarquia!,
        dataInicio: DateUtilsApi.dateOnlyToApi(model.dataInicio!),
        dataTermino: model.dataTermino ? DateUtilsApi.dateOnlyToApi(model.dataTermino) : null,
    }),
};
