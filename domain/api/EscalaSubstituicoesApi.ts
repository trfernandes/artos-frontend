import { CreateEscalaSubstituicaoDto } from '../dtos/Escala/escala-substituicao.create';
import { ResponseEscalaSubstituicaoDto } from '../dtos/Escala/escala-substituicao.response';
import { UpdateEscalaSubstituicaoDto } from '../dtos/Escala/escala-substituicao.update';
import { DynamicQuery } from '../utils/query_utils';
import { BaseApi } from './BaseApi';
import apiClient from './api-client';

class EscalaSubstituicoesApiClass extends BaseApi<
  ResponseEscalaSubstituicaoDto,
  CreateEscalaSubstituicaoDto,
  UpdateEscalaSubstituicaoDto
> {
  constructor() {
    super('escalas/substituicoes');
  }

  override async search(query: DynamicQuery): Promise<ResponseEscalaSubstituicaoDto[]> {
    const igrejaId = (query as { igrejaId?: string } | undefined)?.igrejaId;
    const response = await apiClient.post(`/${this.resourceName}/search`, query, {
      params: igrejaId ? { igrejaId } : undefined,
    });
    return response.data.data;
  }
}

export const EscalaSubstituicoesApi = new EscalaSubstituicoesApiClass();
