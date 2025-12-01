import { Escala } from '../models/Escala';
import { EscalaTemplateExperienciaEnum, EscalaTemplateTipoEnum } from '../models/EscalaTemplate';
import apiClient from './api-client';
import { BaseApi } from './BaseApi';

export type GerarEscalaTemplateFuncaoDto = {
  id: string;
  quantidade: number;
  experienciaMinima: EscalaTemplateExperienciaEnum;
};

export type GerarEscalaTemplateFixoDto = {
  voluntarioId: string;
  funcaoId: string;
};

export type GerarEscalaEventoEquipePersonalizadaDto = {
  origem: 'personalizada';
  tipo: EscalaTemplateTipoEnum;
  funcoes?: GerarEscalaTemplateFuncaoDto[];
  fixos?: GerarEscalaTemplateFixoDto[];
};

export type GerarEscalaEventoEquipePorTemplateDto = {
  origem: 'porTemplate';
  templateId?: string;
};

export type GerarEscalaEventoDto = {
  id: string;
  data: string;
  equipe: GerarEscalaEventoEquipePorTemplateDto | GerarEscalaEventoEquipePersonalizadaDto;
};

export type GerarEscalaParticipanteDto = {
  voluntarioId: string;
  minVolId: string;
};

export type GerarEscalaDto = {
  ministerioId: string;
  nome: string;
  dataInicio: string;
  dataTermino: string;
  eventos?: GerarEscalaEventoDto[];
  participantes?: GerarEscalaParticipanteDto[];
  criadoPor: string;
};

class EscalasApiClass extends BaseApi<Escala> {
  constructor() {
    super('escalas');
  }

  async generate(data: GerarEscalaDto): Promise<Escala> {
    try {
      const response = await apiClient.post(`/${this.resourceName}/gerar`, data);
      return response.data.data;
    } catch (error) {
      console.log(`Erro ao gerar ${this.resourceName}:`, error);
      throw error;
    }
  }
}

export const EscalasApi = new EscalasApiClass();
