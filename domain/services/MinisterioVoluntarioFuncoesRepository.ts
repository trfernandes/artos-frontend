import apiClient from '../api/api-client';
import { apiName, MinisterioVoluntarioFuncoesApi } from '../api/MinisterioVoluntarioFuncoesApi';
import { EscalaTemplateExperienciaEnum } from '../models/EscalaTemplate';
import {
  MinisterioVoluntarioFuncao,
  MinisterioVoluntarioFuncaoStatusEnum,
} from '../models/MinisterioVoluntarioFuncao';
import { BaseRepository } from './BaseRepository';

export interface UpdateFuncaoDataDto {
    funcaoId: string;
    status: MinisterioVoluntarioFuncaoStatusEnum;
    experiencia: EscalaTemplateExperienciaEnum;
  }

export interface UpdateFuncoesDataDto {
  funcoes: UpdateFuncaoDataDto[];
}

class MinisterioVoluntarioFuncoesRepositoryClass extends BaseRepository<MinisterioVoluntarioFuncao> {
  constructor() {
    super(MinisterioVoluntarioFuncoesApi);
  }

  async updateFuncoes(
    ministerioVoluntarioId: string,
    data: UpdateFuncoesDataDto
  ): Promise<MinisterioVoluntarioFuncao[]> {
    try {
      const response = await apiClient.put(
        `/${apiName}/voluntarios/${ministerioVoluntarioId}/funcoes`,
        data
      );
      return response.data.data;
    } catch (error) {
      console.log(`Erro ao atualizar as funções ${apiName} ${ministerioVoluntarioId}:`, error);
      throw error;
    }
  }
}

export const MinisterioVoluntarioFuncoesRepository =
  new MinisterioVoluntarioFuncoesRepositoryClass();
