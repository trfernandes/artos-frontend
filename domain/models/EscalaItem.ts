import { EscalaApiModel, EscalaModel, EscalaSerializer } from './Escala';
import { EscalaSubstituicaoApiModel, EscalaSubstituicaoModel, EscalaSubstituicaoSerializer } from './EscalaSubstituicao';
import { EventoApiModel, EventoModel, EventoSerializer } from './Evento';
import { BaseApiModel, BaseModel, ModelSerializer } from './BaseModel';
import { MinisterioFuncaoModel, MinisterioFuncaoApiModel, MinisterioFuncaoSerializer } from './MinisterioFuncao';
import { MinisterioVoluntarioApiModel, MinisterioVoluntarioModel, MinisterioVoluntarioSerializer } from './MinisterioVoluntario';
import { DateUtilsApi } from '../../utils/date_utils';
import { ApiUtils } from '../../utils/apiUtils';

export enum EscalaItemStatusEnum {
    Pendente = '0',
    Confirmado = '1',
    Ausente = '2',
    Substituido = '3',
    SubstituicaoSolicitada = '4',
}

export const EscalaItemStatusEnumLabel: Record<EscalaItemStatusEnum, string> = {
    [EscalaItemStatusEnum.Pendente]: 'Pendente',
    [EscalaItemStatusEnum.Confirmado]: 'Confirmado',
    [EscalaItemStatusEnum.Ausente]: 'Ausente',
    [EscalaItemStatusEnum.Substituido]: 'Substituído',
    [EscalaItemStatusEnum.SubstituicaoSolicitada]: 'Subst. Solicitada',
};

export interface EscalaItemModel extends BaseModel {
    escalaId: string;
    escala?: EscalaModel;
    eventoId: string;
    evento?: EventoModel;
    dataOcorrencia: Date;
    voluntarioId?: string;
    voluntario?: MinisterioVoluntarioModel;
    funcaoId?: string;
    funcao?: MinisterioFuncaoModel;
    status: EscalaItemStatusEnum;
    substituicaoId?: string;
    substituicao?: EscalaSubstituicaoModel;
}

export interface EscalaItemApiModel extends BaseApiModel {
    escalaId: string;
    escala?: EscalaApiModel | null;
    eventoId: string;
    evento?: EventoApiModel | null;
    dataOcorrencia: string;
    voluntarioId?: string;
    voluntario?: MinisterioVoluntarioApiModel | null;
    funcaoId: string;
    funcao?: MinisterioFuncaoApiModel | null;
    status: EscalaItemStatusEnum;
    substituicaoId?: string | null;
    substituicao?: EscalaSubstituicaoApiModel;
}

export const EscalaItemSerializer: ModelSerializer<EscalaItemModel, EscalaItemApiModel> = {
    fromApi: (apiModel: Partial<EscalaItemApiModel>): EscalaItemModel => {
        return {
            id: apiModel.id,
            escalaId: apiModel.escalaId!,
            escala: EscalaSerializer.fromApi(apiModel.escala!),
            eventoId: apiModel.eventoId!,
            evento: apiModel.evento ? EventoSerializer.fromApi(apiModel.evento) : undefined,
            dataOcorrencia: DateUtilsApi.dateTimeFromApi(apiModel.dataOcorrencia!),
            createdAt: apiModel.createdAt && DateUtilsApi.dateTimeFromApi(apiModel.createdAt),
            updatedAt: apiModel.updatedAt && DateUtilsApi.dateTimeFromApi(apiModel.updatedAt),
            status: apiModel.status!,
            voluntarioId: apiModel.voluntarioId,
            voluntario: MinisterioVoluntarioSerializer.fromApi(apiModel.voluntario!),
            funcaoId: apiModel.funcaoId!,
            funcao: MinisterioFuncaoSerializer.fromApi(apiModel.funcao!),
            substituicao: apiModel.substituicao ? EscalaSubstituicaoSerializer.fromApi(apiModel.substituicao) : undefined,
        };
    },
    toApi: (model: Partial<EscalaItemModel>): EscalaItemApiModel => {
        return {
            id: model.id,
            createdAt: model.createdAt,
            updatedAt: model.updatedAt,
            dataOcorrencia: ApiUtils.normalizeOptionalDataToApi(DateUtilsApi.dateTimeToApi(model.dataOcorrencia!)),
            escalaId: model.escalaId!,
            escala: model.escala && ApiUtils.normalizeOptionalDataToApi(EscalaSerializer.toApi(model.escala)),
            eventoId: model.eventoId!,
            evento: model.evento && ApiUtils.normalizeOptionalDataToApi(EventoSerializer.toApi(model.evento)),
            status: model.status ? model.status : EscalaItemStatusEnum.Pendente,
            funcaoId: model.funcaoId!,
            funcao: model.funcao && ApiUtils.normalizeOptionalDataToApi(MinisterioFuncaoSerializer.toApi(model.funcao)),
            voluntarioId: model.voluntarioId,
            voluntario: model.voluntario && ApiUtils.normalizeOptionalDataToApi(MinisterioVoluntarioSerializer.toApi(model.voluntario)),
            substituicao: model.substituicao ? EscalaSubstituicaoSerializer.toApi(model.substituicao) : undefined,
        };
    },
};
