import { CreateIndisponibilidadeVoluntarioDto } from '../dtos/IndisponibilidadeVoluntario/indisponibilidade-voluntario.create';
import { ResponseIndisponibilidadeVoluntarioDto } from '../dtos/IndisponibilidadeVoluntario/indisponibilidade-voluntario.response';
import { UpdateIndisponibilidadeVoluntarioDto } from '../dtos/IndisponibilidadeVoluntario/indisponibilidade-voluntario.update';
import { UpsertIndisponibilidadesVoluntarioDto } from '../dtos/IndisponibilidadeVoluntario/upsert-indisponibilidades-voluntario.dto';
import { BaseApi } from './BaseApi';
import apiClient from './api-client';

class IndisponibilidadesVoluntariosApiClass extends BaseApi<
  ResponseIndisponibilidadeVoluntarioDto,
  CreateIndisponibilidadeVoluntarioDto,
  UpdateIndisponibilidadeVoluntarioDto
> {
  constructor() {
    super('indisponibilidades-voluntarios');
  }

  async create(
    data: CreateIndisponibilidadeVoluntarioDto,
  ): Promise<ResponseIndisponibilidadeVoluntarioDto> {
    if (__DEV__) {
      console.log('[IndisponibilidadesApi] CREATE');
    }
    const result = await super.create({ ...data });
    return result;
  }

  async search(query: any): Promise<ResponseIndisponibilidadeVoluntarioDto[]> {
    if (__DEV__) {
      console.log('[IndisponibilidadesApi] SEARCH');
    }
    const igrejaId = (query as { igrejaId?: string } | undefined)?.igrejaId;
    const response = await apiClient.post(`/indisponibilidades-voluntarios/search`, query, {
      params: igrejaId ? { igrejaId } : undefined,
    });
    return response.data.data;
  }

  async upsertMany(
    payload: UpsertIndisponibilidadesVoluntarioDto,
  ): Promise<ResponseIndisponibilidadeVoluntarioDto[]> {
    if (__DEV__) {
      console.log('[IndisponibilidadesApi] UPSERT -', payload.indisponibilidades.length, 'itens');
    }
    const response = await apiClient.post(`/indisponibilidades-voluntarios/upsert`, payload);
    return response.data.data;
  }

  async update(
    id: string,
    data: UpdateIndisponibilidadeVoluntarioDto,
  ): Promise<ResponseIndisponibilidadeVoluntarioDto> {
    if (__DEV__) {
      console.log('[IndisponibilidadesApi] UPDATE -', id);
    }
    const result = await super.update(id, data);
    return result;
  }

  async delete(id: string, igrejaId?: string): Promise<void> {
    if (__DEV__) {
      console.log('[IndisponibilidadesApi] DELETE -', id);
    }
    await apiClient.delete(`/indisponibilidades-voluntarios/${id}`, {
      params: igrejaId ? { igrejaId } : undefined,
    });
  }
}

export const IndisponibilidadesVoluntariosApi = new IndisponibilidadesVoluntariosApiClass();
