import { EscalaItemApiModel, EscalaItemModel, EscalaItemSerializer } from './EscalaItem';
import { BaseApiModel, BaseModel, ModelSerializer } from './BaseModel';
import { MinisterioVoluntarioApiModel, MinisterioVoluntarioModel, MinisterioVoluntarioSerializer } from './MinisterioVoluntario';
import { DateUtilsApi } from '../../utils/date_utils';

export interface EscalaSubstituicaoModel extends BaseModel {
    escalaItemId: string;
    escalaItem?: Partial<EscalaItemModel>;
    solicitanteId: string;
    solicitante?: Partial<MinisterioVoluntarioModel>;
    substitutoId: string;
    substituto?: Partial<MinisterioVoluntarioModel>;
    dataSolicitacao: Date;
    dataResposta?: Date;
    status?: EscalaSubstituicaoStatusEnum;
    motivo: string;
}

export interface EscalaSubstituicaoApiModel extends BaseApiModel {
    escalaItemId: string;
    escalaItem?: EscalaItemApiModel | null;
    solicitanteId: string;
    solicitante?: MinisterioVoluntarioApiModel | null;
    substitutoId: string;
    substituto?: MinisterioVoluntarioApiModel | null;
    dataSolicitacao: string;
    dataResposta: string | null;
    status: EscalaSubstituicaoStatusEnum | null;
    motivo: string;
}

export const EscalaSubstituicaoSerializer: ModelSerializer<EscalaSubstituicaoModel, EscalaSubstituicaoApiModel> = {
    fromApi: (apiModel: Partial<EscalaSubstituicaoApiModel>): EscalaSubstituicaoModel => ({
        id: apiModel.id,
        dataSolicitacao: DateUtilsApi.dateTimeFromApi(apiModel.dataSolicitacao!),
        dataResposta: apiModel.dataResposta ? DateUtilsApi.dateTimeFromApi(apiModel.dataResposta) : undefined,
        motivo: apiModel.motivo!,
        status: apiModel.status ?? undefined,
        escalaItemId: apiModel.escalaItemId!,
        escalaItem: apiModel.escalaItem ? EscalaItemSerializer.fromApi(apiModel.escalaItem) : undefined,
        solicitanteId: apiModel.solicitanteId!,
        solicitante: apiModel.solicitante ? MinisterioVoluntarioSerializer.fromApi(apiModel.solicitante) : undefined,
        substitutoId: apiModel.substitutoId!,
        substituto: apiModel.substituto && MinisterioVoluntarioSerializer.fromApi(apiModel.substituto),
        createdAt: apiModel.createdAt,
        updatedAt: apiModel.updatedAt,
    }),
    toApi: (model: Partial<EscalaSubstituicaoModel>): EscalaSubstituicaoApiModel => ({
        id: model.id,
        dataSolicitacao: DateUtilsApi.dateTimeToApi(model.dataSolicitacao!),
        dataResposta: model.dataResposta ? DateUtilsApi.dateTimeToApi(model.dataResposta) : null,
        motivo: model.motivo!,
        status: model.status ?? null,
        escalaItemId: model.escalaItemId!,
        escalaItem: model.escalaItem ? EscalaItemSerializer.toApi(model.escalaItem) : null,
        solicitanteId: model.solicitanteId!,
        solicitante: model.solicitante ? MinisterioVoluntarioSerializer.toApi(model.solicitante) : null,
        substitutoId: model.substitutoId!,
        substituto: model.substituto ? MinisterioVoluntarioSerializer.toApi(model.substituto) : null,
        createdAt: model.createdAt,
        updatedAt: model.updatedAt,
    }),
};

export enum EscalaSubstituicaoStatusEnum {
    Pendente = '0',
    Aprovada = '1',
    Recusada = '2',
}
