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

  create(data: CreateIndisponibilidadeVoluntarioDto): Promise<ResponseIndisponibilidadeVoluntarioDto> {
    return super.create({ ...data });
  }

  async upsertMany(payload: UpsertIndisponibilidadesVoluntarioDto): Promise<ResponseIndisponibilidadeVoluntarioDto[]> {
    console.log('IndisponibilidadesVoluntariosApi.upsertMany called with:', payload);
    const response = await apiClient.post(`/indisponibilidades-voluntarios/upsert`, payload);
    return response.data.data;
  }
}

export const IndisponibilidadesVoluntariosApi = new IndisponibilidadesVoluntariosApiClass();
