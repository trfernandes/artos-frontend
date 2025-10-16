import { Identifiable } from './Indentifiable';
import { Ministerio } from './Ministerio';
import { MinisterioFuncao } from './MinisterioFuncao';
import { Voluntario } from './Voluntario';

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
  Iniciante = 0,
  Intermediario = 1,
  Avancado = 2,
}

export const EscalaTemplateExperienciaEnumMap: Record<number, EscalaTemplateExperienciaEnum> = {
  0: EscalaTemplateExperienciaEnum.Iniciante,
  1: EscalaTemplateExperienciaEnum.Intermediario,
  2: EscalaTemplateExperienciaEnum.Avancado,
};

export const EscalaTemplateExperienciaLabel: Record<EscalaTemplateExperienciaEnum, string> = {
  [EscalaTemplateExperienciaEnum.Iniciante]: 'Iniciante',
  [EscalaTemplateExperienciaEnum.Intermediario]: 'Intermediário',
  [EscalaTemplateExperienciaEnum.Avancado]: 'Avançado',
};

export interface EscalaTemplateVoluntario extends Identifiable {
  voluntarioId: string;
  voluntario?: Voluntario;
  funcaoId: string;
  funcao?: MinisterioFuncao;
}

export interface EscalaTemplateFuncao extends Identifiable {
  funcaoId: string;
  funcao?: MinisterioFuncao;
  experiencia: EscalaTemplateExperienciaEnum;
  quantidade: number;
}

export interface EscalaTemplate extends Identifiable {
  ministerioId: string;
  ministerio?: Ministerio;
  nome: string;
  tipo: EscalaTemplateTipoEnum;
  voluntarios?: EscalaTemplateVoluntario[];
  funcoes?: EscalaTemplateFuncao[];
  respSetListVoluntarios?: Voluntario;
  respSetListVoluntariosId?: string;
  respSetListFuncoes?: MinisterioFuncao;
  respSetListFuncoesId?: string;
  createdAt?: string;
  updatedAt?: string;
}
