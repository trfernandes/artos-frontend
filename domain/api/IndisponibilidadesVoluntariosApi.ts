import {
  IndisponibilidadeVoluntarioApiModel,
  UpsertIndisponibilidadesVoluntarioDto,
} from '../models/IndisponibilidadeVoluntario';
import { BaseApi } from './BaseApi';
import apiClient from './api-client';

class IndisponibilidadesVoluntariosApiClass extends BaseApi<IndisponibilidadeVoluntarioApiModel> {
  constructor() {
    super('indisponibilidades-voluntarios');
  }

  create(data: IndisponibilidadeVoluntarioApiModel): Promise<IndisponibilidadeVoluntarioApiModel> {
    return super.create({ ...data });
  }

  async upsertMany(payload: UpsertIndisponibilidadesVoluntarioDto): Promise<IndisponibilidadeVoluntarioApiModel[]> {
    console.log('IndisponibilidadesVoluntariosApi.upsertMany called with:', payload);
    const response = await apiClient.post(`/indisponibilidades-voluntarios/upsert`, payload);
    return response.data.data;
  }
}

export const IndisponibilidadesVoluntariosApi = new IndisponibilidadesVoluntariosApiClass();
