import apiClient from '../api/api-client';
import { apiName, MinisterioVoluntarioFuncoesApi } from '../api/MinisterioVoluntarioFuncoesApi';
import { CreateMinisterioVoluntarioFuncaoDto } from '../dtos/MinisterioVoluntarioFuncao/ministerio-voluntario-funcao.create';
import { ResponseMinisterioVoluntarioFuncaoDto } from '../dtos/MinisterioVoluntarioFuncao/ministerio-voluntario-funcao.response';
import { UpdateMinisterioVoluntarioFuncaoDto } from '../dtos/MinisterioVoluntarioFuncao/ministerio-voluntario-funcao.update';
import { BaseRepository } from './BaseRepository';

type StatusType = NonNullable<CreateMinisterioVoluntarioFuncaoDto['status']>;
type ExperienciaType = NonNullable<CreateMinisterioVoluntarioFuncaoDto['experiencia']>;

export interface UpdateFuncaoDataDto {
  funcaoId: string;
  status: StatusType;
  experiencia: ExperienciaType;
}

export interface UpdateFuncoesDataDto {
  funcoes: UpdateFuncaoDataDto[];
}

class MinisterioVoluntarioFuncoesRepositoryClass extends BaseRepository<
  ResponseMinisterioVoluntarioFuncaoDto,
  CreateMinisterioVoluntarioFuncaoDto,
  UpdateMinisterioVoluntarioFuncaoDto
> {
  constructor() {
    super(MinisterioVoluntarioFuncoesApi);
  }

  async updateFuncoes(
    ministerioVoluntarioId: string,
    data: UpdateFuncoesDataDto,
  ): Promise<ResponseMinisterioVoluntarioFuncaoDto[]> {
    try {
      const response = await apiClient.put(
        `/${apiName}/voluntarios/${ministerioVoluntarioId}/funcoes`,
        data,
      );
      return response.data.data;
    } catch (error) {
      console.log(`Erro ao atualizar as funcoes ${apiName} ${ministerioVoluntarioId}:`, error);
      throw error;
    }
  }
}

export const MinisterioVoluntarioFuncoesRepository =
  new MinisterioVoluntarioFuncoesRepositoryClass();
