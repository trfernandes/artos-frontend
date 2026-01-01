import { EscalaTemplateApiModel, EscalaTemplateModel, EscalaTemplateSerializer } from './EscalaTemplate';
import { BaseApiModel, BaseModel, ModelSerializer } from './BaseModel';
import { DateUtilsApi } from '../../utils/date_utils';

export interface EventoModel extends BaseModel {
    nome: string;
    descricao?: string;
    dataInicio: Date;
    dataTermino?: Date;
    local?: string;
    cor: string;
    recorrencia?: RecorrenciaEnum;
    recorrenciaSemanaDias?: RecorrenciaDiaSemanaEnum[];
    recorrenciaACadaMeses?: number;
    recorrenciaSemanasMes?: RecorrenciaSemanaMesEnum[];
    templatePadraoId?: string;
    templatePadrao?: EscalaTemplateModel;
}

export interface EventoApiModel extends BaseApiModel {
    id: string;
    nome: string;
    descricao: string | null;
    dataInicio: string;
    dataTermino: string | null;
    local: string | null;
    cor: string;
    recorrencia: RecorrenciaEnum | null;
    recorrenciaSemanaDias: RecorrenciaDiaSemanaEnum[] | null;
    recorrenciaACadaMeses: number | null;
    recorrenciaSemanasMes: RecorrenciaSemanaMesEnum[] | null;
    templatePadraoId?: string | null;
    templatePadrao?: EscalaTemplateApiModel | null;
    updatedAt: Date;
    createdAt: Date;
}

export const EventoSerializer: ModelSerializer<EventoModel, EventoApiModel> = {
    fromApi: (apiModel: Partial<EventoApiModel>): EventoModel => ({
        id: apiModel.id,
        nome: apiModel.nome!,
        descricao: apiModel.descricao ?? undefined,
        dataInicio: DateUtilsApi.dateTimeFromApi(apiModel.dataInicio!),
        dataTermino: apiModel.dataTermino ? DateUtilsApi.dateTimeFromApi(apiModel.dataTermino) : undefined,
        cor: apiModel.cor!,
        local: apiModel.local ?? undefined,
        recorrencia: apiModel.recorrencia ?? undefined,
        recorrenciaSemanaDias: apiModel.recorrenciaSemanaDias ?? undefined,
        recorrenciaACadaMeses: apiModel.recorrenciaACadaMeses ?? undefined,
        recorrenciaSemanasMes: apiModel.recorrenciaSemanasMes ?? undefined,
        templatePadraoId: apiModel.templatePadraoId ?? undefined,
        templatePadrao: EscalaTemplateSerializer.fromApi(apiModel.templatePadrao!),
        createdAt: apiModel.createdAt,
        updatedAt: apiModel.updatedAt,
    }),
    toApi: (model: Partial<EventoModel>): EventoApiModel => ({
        id: model.id!,
        nome: model.nome!,
        descricao: model.descricao ?? null,
        dataInicio: DateUtilsApi.dateTimeToApi(model.dataInicio!),
        dataTermino: model.dataTermino ? DateUtilsApi.dateTimeToApi(model.dataTermino) : null,
        cor: model.cor!,
        local: model.local ?? null,
        recorrencia: model.recorrencia ?? null,
        recorrenciaSemanaDias: model.recorrenciaSemanaDias ?? null,
        recorrenciaACadaMeses: model.recorrenciaACadaMeses ?? null,
        recorrenciaSemanasMes: model.recorrenciaSemanasMes ?? null,
        templatePadraoId: model.templatePadraoId ?? null,
        templatePadrao: EscalaTemplateSerializer.toApi(model.templatePadrao!),
        createdAt: model.createdAt!,
        updatedAt: model.updatedAt!,
    }),
};

export enum RecorrenciaDiaSemanaEnum {
    domingo = 'DOMINGO',
    segunda = 'SEGUNDA',
    terca = 'TERCA',
    quarta = 'QUARTA',
    quinta = 'QUINTA',
    sexta = 'SEXTA',
    sabado = 'SABADO',
}

export const RecorrenciaDiaSemanaEnumMap: Record<string, RecorrenciaDiaSemanaEnum> = {
    DOMINGO: RecorrenciaDiaSemanaEnum.domingo,
    SEGUNDA: RecorrenciaDiaSemanaEnum.segunda,
    TERCA: RecorrenciaDiaSemanaEnum.terca,
    QUARTA: RecorrenciaDiaSemanaEnum.quarta,
    QUINTA: RecorrenciaDiaSemanaEnum.quinta,
    SEXTA: RecorrenciaDiaSemanaEnum.sexta,
    SABADO: RecorrenciaDiaSemanaEnum.sabado,
};

export const RecorrenciaDiaSemanaEnumLabel: Record<RecorrenciaDiaSemanaEnum, { extenso: string; abreviado: string }> = {
    [RecorrenciaDiaSemanaEnum.domingo]: { extenso: 'Domingo', abreviado: 'Dom' },
    [RecorrenciaDiaSemanaEnum.segunda]: { extenso: 'Segunda-Feira', abreviado: 'Seg' },
    [RecorrenciaDiaSemanaEnum.terca]: { extenso: 'Terça-Feira', abreviado: 'Ter' },
    [RecorrenciaDiaSemanaEnum.quarta]: { extenso: 'Quarta-Feira', abreviado: 'Qua' },
    [RecorrenciaDiaSemanaEnum.quinta]: { extenso: 'Quinta-Feira', abreviado: 'Qui' },
    [RecorrenciaDiaSemanaEnum.sexta]: { extenso: 'Sexta-Feira', abreviado: 'Sex' },
    [RecorrenciaDiaSemanaEnum.sabado]: { extenso: 'Sábado', abreviado: 'Sáb' },
};

export enum RecorrenciaEnum {
    Nunca = 'NUNCA',
    Semanal = 'SEMANAL',
    Mensal = 'MENSAL',
}

export const RecorrenciaEnumMap: Record<string, RecorrenciaEnum> = {
    NUNCA: RecorrenciaEnum.Nunca,
    SEMANAL: RecorrenciaEnum.Semanal,
    MENSAL: RecorrenciaEnum.Mensal,
};

export const RecorrenciaEnumLabel: Record<RecorrenciaEnum, string> = {
    [RecorrenciaEnum.Nunca]: 'Nunca',
    [RecorrenciaEnum.Semanal]: 'Semanal',
    [RecorrenciaEnum.Mensal]: 'Mensal',
};

export enum RecorrenciaSemanaMesEnum {
    Primeira = 'PRIMEIRA',
    Segunda = 'SEGUNDA',
    Terceira = 'TERCEIRA',
    Quarta = 'QUARTA',
    Quinta = 'QUINTA',
}

export const RecorrenciaSemanaMesEnumMap: Record<string, RecorrenciaSemanaMesEnum> = {
    PRIMEIRA: RecorrenciaSemanaMesEnum.Primeira,
    SEGUNDA: RecorrenciaSemanaMesEnum.Segunda,
    TERCEIRA: RecorrenciaSemanaMesEnum.Terceira,
    QUARTA: RecorrenciaSemanaMesEnum.Quarta,
    QUINTA: RecorrenciaSemanaMesEnum.Quinta,
};

export const RecorrenciaSemanaMesEnumLabel: Record<RecorrenciaSemanaMesEnum, { extenso: string; abreviado: string }> = {
    [RecorrenciaSemanaMesEnum.Primeira]: { extenso: 'Primeira semana', abreviado: '1ª sem' },
    [RecorrenciaSemanaMesEnum.Segunda]: { extenso: 'Segunda semana', abreviado: '2ª sem' },
    [RecorrenciaSemanaMesEnum.Terceira]: { extenso: 'Terceira semana', abreviado: '3ª sem' },
    [RecorrenciaSemanaMesEnum.Quarta]: { extenso: 'Quarta semana', abreviado: '4ª sem' },
    [RecorrenciaSemanaMesEnum.Quinta]: { extenso: 'Quinta semana', abreviado: '5ª sem' },
};
