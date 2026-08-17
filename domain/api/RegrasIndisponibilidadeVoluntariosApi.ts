import { CreateRegraIndisponibilidadeVoluntarioDto } from '../dtos/RegraIndisponibilidadeVoluntario/regra-indisponibilidade-voluntario.create';
import { ResponseRegraIndisponibilidadeVoluntarioDto } from '../dtos/RegraIndisponibilidadeVoluntario/regra-indisponibilidade-voluntario.response';
import { UpdateRegraIndisponibilidadeVoluntarioDto } from '../dtos/RegraIndisponibilidadeVoluntario/regra-indisponibilidade-voluntario.update';
import { BaseApi } from './BaseApi';
import apiClient from './api-client';

class RegrasIndisponibilidadeVoluntariosApiClass extends BaseApi<
  ResponseRegraIndisponibilidadeVoluntarioDto,
  CreateRegraIndisponibilidadeVoluntarioDto,
  UpdateRegraIndisponibilidadeVoluntarioDto
> {
  constructor() {
    super('regras-indisponibilidade-voluntarios');
  }

  async search(query: any): Promise<ResponseRegraIndisponibilidadeVoluntarioDto[]> {
    const igrejaId = (query as { igrejaId?: string } | undefined)?.igrejaId;
    const response = await apiClient.post(`/regras-indisponibilidade-voluntarios/search`, query, {
      params: igrejaId ? { igrejaId } : undefined,
    });
    return response.data.data;
  }

  async update(
    id: string,
    payload: UpdateRegraIndisponibilidadeVoluntarioDto,
    igrejaId?: string,
  ): Promise<ResponseRegraIndisponibilidadeVoluntarioDto> {
    const response = await apiClient.put(`/regras-indisponibilidade-voluntarios/${id}`, payload, {
      params: igrejaId ? { igrejaId } : undefined,
    });
    return response.data.data;
  }

  async delete(id: string, igrejaId?: string): Promise<void> {
    await apiClient.delete(`/regras-indisponibilidade-voluntarios/${id}`, {
      params: igrejaId ? { igrejaId } : undefined,
    });
  }
}

export const RegrasIndisponibilidadeVoluntariosApi =
  new RegrasIndisponibilidadeVoluntariosApiClass();
