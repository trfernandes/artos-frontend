import { IndisponibilidadeVoluntario, UpsertIndisponibilidadesVoluntarioPayload } from '../models/IndisponibilidadeVoluntario';
import { BaseApi } from './BaseApi';
import apiClient from './api-client';

class IndisponibilidadesVoluntariosApiClass extends BaseApi<IndisponibilidadeVoluntario> {
  constructor() {
    super('indisponibilidades-voluntarios');
  }

  create(data: Omit<IndisponibilidadeVoluntario, 'id' | 'createdAt' | 'updatedAt'>): Promise<IndisponibilidadeVoluntario> {
    return super.create({...data, });
  }

  async upsertMany(payload: UpsertIndisponibilidadesVoluntarioPayload): Promise<IndisponibilidadeVoluntario[]> {
    const response = await apiClient.post(`/indisponibilidades-voluntarios/upsert`, payload);
    return response.data.data;
  }
}

export const IndisponibilidadesVoluntariosApi = new IndisponibilidadesVoluntariosApiClass();
