import { ApiUtils } from '../../utils/apiUtils';
import { DateUtilsApi } from '../../utils/date_utils';
import { BaseApiModel, BaseModel, ModelSerializer } from './BaseModel';
import { IndisponibilidadeVoluntarioModel } from './IndisponibilidadeVoluntario';
import { MinisterioVoluntarioModel } from './MinisterioVoluntario';

export enum VoluntarioPapelEnum {
    Admin = 0,
    Usuario = 1,
}

export interface VoluntarioModel extends BaseModel {
    nome: string;
    email: string;
    dataNascimento?: Date;
    endereco?: string;
    telefone?: string;
    sexo: 'M' | 'F';
    foto?: string;
    papel: VoluntarioPapelEnum;
    uploadFoto?: string;
    status: VoluntarioStatusEnum;
    ministerios?: MinisterioVoluntarioModel[];
    indisponibilidades?: IndisponibilidadeVoluntarioModel[];
}

export interface VoluntarioApiModel extends BaseApiModel {
    nome: string;
    email: string;
    papel: VoluntarioPapelEnum;
    dataNascimento: string | null;
    endereco: string | null;
    telefone: string | null;
    sexo: 'M' | 'F';
    foto: string | null;
    status: VoluntarioStatusEnum;
}

export const VoluntarioSerializer: ModelSerializer<VoluntarioModel, VoluntarioApiModel> = {
    fromApi: (apiModel: Partial<VoluntarioApiModel>): VoluntarioModel => ({
        id: apiModel.id,
        dataNascimento: DateUtilsApi.dateOnlyFromApi(apiModel.dataNascimento!),
        email: apiModel.email!,
        foto: apiModel.foto!,
        nome: apiModel.nome!,
        papel: apiModel.papel!,
        sexo: apiModel.sexo!,
        status: apiModel.status!,
        endereco: apiModel.endereco!,
        telefone: apiModel.telefone!,
        createdAt: apiModel.createdAt,
        updatedAt: apiModel.updatedAt,
    }),
    toApi: (model: Partial<VoluntarioModel>): VoluntarioApiModel => ({
        id: model.id,
        nome: model.nome!,
        dataNascimento: ApiUtils.normalizeOptionalDataToApi(model.dataNascimento),
        email: model.email!,
        foto: ApiUtils.normalizeOptionalDataToApi(model.foto),
        papel: model.papel!,
        sexo: model.sexo!,
        status: model.status!,
        endereco: ApiUtils.normalizeOptionalDataToApi(model.endereco),
        telefone: ApiUtils.normalizeOptionalDataToApi(model.telefone),
    }),
};

export enum VoluntarioStatusEnum {
    Ativo = '0',
    Inativo = '1',
}

export const VoluntarioStatusEnumLabel: Record<VoluntarioStatusEnum, string> = {
    [VoluntarioStatusEnum.Ativo]: 'Ativo',
    [VoluntarioStatusEnum.Inativo]: 'Inativo',
};

export const VoluntarioStatusEnumMap: Record<string, VoluntarioStatusEnum> = {
    '0': VoluntarioStatusEnum.Ativo,
    '1': VoluntarioStatusEnum.Inativo,
};

export const VoluntarioSexoLabel: Record<string, string> = {
    M: 'Masculino',
    F: 'Feminino',
};

export function calculateProfileCompletion(voluntario: Partial<VoluntarioModel>): number {
    const requiredFields: (keyof VoluntarioModel)[] = ['nome', 'telefone', 'foto', 'endereco', 'dataNascimento', 'sexo'];

    const filledCount = requiredFields.reduce((count, field) => {
        const value = voluntario[field];
        if (value && value.toString().trim() !== '') {
            return count + 1;
        }
        return count;
    }, 0);

    return Math.round((filledCount / requiredFields.length) * 100);
}
