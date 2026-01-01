import { DateUtilsApi } from '../../utils/date_utils';
import { BaseApiModel, BaseModel, ModelSerializer } from './BaseModel';
import { MinisterioVoluntarioApiModel, MinisterioVoluntarioModel, MinisterioVoluntarioSerializer } from './MinisterioVoluntario';

export interface IndisponibilidadeVoluntarioModel extends BaseModel {
    data: Date;
    motivo?: string;
    voluntarioId: string;
    voluntario?: MinisterioVoluntarioModel;
}

export interface IndisponibilidadeVoluntarioApiModel extends BaseApiModel {
    data: string;
    motivo: string | null;
    voluntarioId: string;
    voluntario?: MinisterioVoluntarioApiModel | null;
}

export const IndisponibilidadeVoluntarioSerializer: ModelSerializer<IndisponibilidadeVoluntarioModel, IndisponibilidadeVoluntarioApiModel> = {
    fromApi: (apiModel: Partial<IndisponibilidadeVoluntarioApiModel>): IndisponibilidadeVoluntarioModel => {
        return {
            data: DateUtilsApi.dateOnlyFromApi(apiModel.data!),
            id: apiModel.id,
            motivo: apiModel.motivo ?? undefined,
            voluntarioId: apiModel.voluntarioId!,
            voluntario: MinisterioVoluntarioSerializer.fromApi(apiModel.voluntario!),
            createdAt: apiModel.createdAt,
            updatedAt: apiModel.updatedAt,
        };
    },
    toApi: (model: Partial<IndisponibilidadeVoluntarioModel>): IndisponibilidadeVoluntarioApiModel => {
        return {
            id: model.id,
            data: DateUtilsApi.dateOnlyToApi(model.data!),
            motivo: model.motivo ?? null,
            voluntarioId: model.voluntarioId!,
            voluntario: MinisterioVoluntarioSerializer.toApi(model.voluntario!),
        };
    },
};

export interface UpsertIndisponibilidadeVoluntarioItem {
    id?: string;
    data: string;
    motivo?: string | null;
}

export interface UpsertIndisponibilidadesVoluntarioDto {
    voluntarioId: string;
    indisponibilidades: UpsertIndisponibilidadeVoluntarioItem[];
}
