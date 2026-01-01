import { BaseApiModel, BaseModel, ModelSerializer } from './BaseModel';
import { EscalaTemplateFuncaoModel, EscalaTemplateFuncaoApiModel, EscalaTemplateFuncaoSerializer } from './EscalaTemplateFuncao';
import { EscalaTemplateVoluntarioModel, EscalaTemplateVoluntarioApiModel, EscalaTemplateVoluntarioSerializer } from './EscalaTemplateVoluntario';
import { MinisterioApiModel, MinisterioModel, MinisterioSerializer } from './Ministerio';
import { MinisterioFuncaoModel, MinisterioFuncaoApiModel, MinisterioFuncaoSerializer } from './MinisterioFuncao';
import { VoluntarioApiModel, VoluntarioModel, VoluntarioSerializer } from './Voluntario';

export enum EscalaTemplateTipoEnum {
    Fixo = '0',
    Funcoes = '1',
}

export const EscalaTemplateTipoEnumMap: Record<number, EscalaTemplateTipoEnum> = {
    '0': EscalaTemplateTipoEnum.Fixo,
    '1': EscalaTemplateTipoEnum.Funcoes,
};

export const EscalaTemplateTipoLabel: Record<EscalaTemplateTipoEnum, string> = {
    [EscalaTemplateTipoEnum.Fixo]: 'Fixo',
    [EscalaTemplateTipoEnum.Funcoes]: 'Funções',
};

export enum EscalaTemplateExperienciaEnum {
    Iniciante = '0',
    Intermediario = '1',
    Avancado = '2',
}

export const EscalaTemplateExperienciaEnumMap: Record<number, EscalaTemplateExperienciaEnum> = {
    '0': EscalaTemplateExperienciaEnum.Iniciante,
    '1': EscalaTemplateExperienciaEnum.Intermediario,
    '2': EscalaTemplateExperienciaEnum.Avancado,
};

export const EscalaTemplateExperienciaLabel: Record<EscalaTemplateExperienciaEnum, string> = {
    [EscalaTemplateExperienciaEnum.Iniciante]: 'Iniciante',
    [EscalaTemplateExperienciaEnum.Intermediario]: 'Intermediário',
    [EscalaTemplateExperienciaEnum.Avancado]: 'Avançado',
};

export interface EscalaTemplateModel extends BaseModel {
    ministerioId: string;
    ministerio?: MinisterioModel;
    nome: string;
    tipo: EscalaTemplateTipoEnum;
    voluntarios?: EscalaTemplateVoluntarioModel[];
    funcoes?: EscalaTemplateFuncaoModel[];
    respSetListVoluntariosId: string;
    respSetListVoluntarios?: VoluntarioModel;
    respSetListFuncoesId: string;
    respSetListFuncoes?: MinisterioFuncaoModel;
}

export interface EscalaTemplateApiModel extends BaseApiModel {
    ministerioId: string;
    ministerio: MinisterioApiModel;
    nome: string;
    tipo: EscalaTemplateTipoEnum;
    voluntarios?: EscalaTemplateVoluntarioApiModel[] | null;
    funcoes?: EscalaTemplateFuncaoApiModel[] | null;
    respSetListVoluntariosId: string;
    respSetListVoluntarios?: VoluntarioApiModel | null;
    respSetListFuncoesId: string;
    respSetListFuncoes?: MinisterioFuncaoApiModel | null;
}

export const EscalaTemplateSerializer: ModelSerializer<EscalaTemplateModel, EscalaTemplateApiModel> = {
    fromApi: (apiModel: Partial<EscalaTemplateApiModel>): EscalaTemplateModel => ({
        id: apiModel.id,
        ministerioId: apiModel.ministerioId!,
        ministerio: MinisterioSerializer.fromApi(apiModel.ministerio!),
        nome: apiModel.nome!,
        tipo: apiModel.tipo!,
        voluntarios: apiModel.voluntarios?.map((voluntario) => EscalaTemplateVoluntarioSerializer.fromApi(voluntario)) || [],
        funcoes: apiModel.funcoes?.map((funcao) => EscalaTemplateFuncaoSerializer.fromApi(funcao)) || [],
        respSetListVoluntariosId: apiModel.respSetListVoluntariosId!,
        respSetListVoluntarios: VoluntarioSerializer.fromApi(apiModel.respSetListVoluntarios!),
        respSetListFuncoesId: apiModel.respSetListFuncoesId!,
        respSetListFuncoes: MinisterioFuncaoSerializer.fromApi(apiModel.respSetListFuncoes!),
        createdAt: apiModel.createdAt,
        updatedAt: apiModel.updatedAt,
    }),
    toApi: (model: Partial<EscalaTemplateModel>): EscalaTemplateApiModel => ({
        id: model.id,
            ministerioId: model.ministerioId!,
        ministerio: MinisterioSerializer.toApi(model.ministerio!),
        nome: model.nome!,
        tipo: model.tipo!,
        voluntarios: model.voluntarios?.map((voluntario) => EscalaTemplateVoluntarioSerializer.toApi(voluntario)) || [],
        funcoes: model.funcoes?.map((funcao) => EscalaTemplateFuncaoSerializer.toApi(funcao)) || [],
        respSetListFuncoesId: model.respSetListFuncoesId!,
        respSetListVoluntarios: VoluntarioSerializer.toApi(model.respSetListVoluntarios!),
        respSetListVoluntariosId: model.respSetListVoluntariosId!,
        respSetListFuncoes: MinisterioFuncaoSerializer.toApi(model.respSetListFuncoes!),
        createdAt: model.createdAt,
        updatedAt: model.updatedAt,
    }),
};
