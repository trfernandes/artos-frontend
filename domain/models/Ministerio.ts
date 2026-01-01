import { ApiUtils } from '../../utils/apiUtils';
import { BaseApiModel, BaseModel } from './BaseModel';
import { MinisterioFuncaoApiModel, MinisterioFuncaoModel, MinisterioFuncaoSerializer } from './MinisterioFuncao';
import { MinisterioVoluntarioApiModel, MinisterioVoluntarioModel, MinisterioVoluntarioSerializer } from './MinisterioVoluntario';

export interface MinisterioModel extends BaseModel {
    nome: string;
    descricao?: string; // null da API vira undefined no app
    logo?: string; // null da API vira undefined no app
    tipo: MinisterioTipoEnum;
    status: MinisterioStatusEnum;

    // se você sempre recebe do endpoint, pode deixar obrigatório também
    voluntarios?: MinisterioVoluntarioModel[];
    funcoes?: MinisterioFuncaoModel[];

    // só do app
    uploadLogo?: string | null;
}

export interface MinisterioApiModel extends BaseApiModel {
    nome: string;
    descricao: string | null;
    logo: string | null;
    tipo: MinisterioTipoEnum;
    status: MinisterioStatusEnum;
    voluntarios: MinisterioVoluntarioApiModel[];
    funcoes: MinisterioFuncaoApiModel[];
}

export const MinisterioSerializer = {
    fromApi: (api: MinisterioApiModel): MinisterioModel => ({
        id: api.id,
        nome: api.nome,
        descricao: ApiUtils.nullToUndef(api.descricao),
        logo: ApiUtils.nullToUndef(api.logo),
        tipo: api.tipo,
        status: api.status,
        voluntarios: api.voluntarios?.map(MinisterioVoluntarioSerializer.fromApi) ?? [],
        funcoes: api.funcoes?.map(MinisterioFuncaoSerializer.fromApi) ?? [],
        // uploadLogo não vem da API
    }),

    // toApiUpdate: model -> payload PATCH (omite undefined)
    toApiUpdate: (model: Partial<MinisterioModel>): MinisterioUpsertApi => {
        const payload: MinisterioUpsertApi = {};

        if (ApiUtils.isDefined(model.nome)) payload.nome = model.nome;
        if (ApiUtils.isDefined(model.tipo)) payload.tipo = model.tipo;
        if (ApiUtils.isDefined(model.status)) payload.status = model.status;

        // aqui você decide: permitir limpar com null
        if (model.descricao !== undefined) payload.descricao = model.descricao ?? null;
        if (model.logo !== undefined) payload.logo = model.logo ?? null;

        // listas: sugiro omitir quando undefined; [] zera
        if (model.voluntarios !== undefined) {
            payload.voluntarios = model.voluntarios.map(MinisterioVoluntarioSerializer.toApi);
        }
        if (model.funcoes !== undefined) {
            payload.funcoes = model.funcoes.map(MinisterioFuncaoSerializer.toApi);
        }

        return payload;
    },
} satisfies {
    fromApi: (api: MinisterioApiModel) => MinisterioModel;
//     toApiUpdate: (model: Partial<MinisterioModel>) => MinisterioUpsertApi;
};

export enum MinisterioStatusEnum {
    Ativo = '0',
    Inativo = '1',
}

export const MinisterioStatusEnumMap: Record<string, MinisterioStatusEnum> = {
    '0': MinisterioStatusEnum.Ativo,
    '1': MinisterioStatusEnum.Inativo,
};

export const MinisterioStatusLabel: Record<MinisterioStatusEnum, string> = {
    [MinisterioStatusEnum.Ativo]: 'Ativo',
    [MinisterioStatusEnum.Inativo]: 'Inativo',
};

export enum MinisterioTipoEnum {
    Outros = '1',
    Louvor = '2',
}

export const MinisterioTipoLabel: Record<MinisterioTipoEnum, string> = {
    [MinisterioTipoEnum.Outros]: 'Outros',
    [MinisterioTipoEnum.Louvor]: 'Louvor',
};

export const MinisterioTipoEnumMap: Record<number, MinisterioTipoEnum> = {
    1: MinisterioTipoEnum.Outros,
    2: MinisterioTipoEnum.Louvor,
};
