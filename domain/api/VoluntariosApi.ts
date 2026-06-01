import { CreateVoluntarioDto } from '../dtos/Voluntario/voluntario.create';
import { ResponseVoluntarioDto } from '../dtos/Voluntario/voluntario.response';
import { UpdateVoluntarioDto } from '../dtos/Voluntario/voluntario.update';
import { BaseApi } from './BaseApi';
import apiClient from './api-client';

class VoluntariosApiClass extends BaseApi<
  ResponseVoluntarioDto,
  CreateVoluntarioDto,
  UpdateVoluntarioDto
> {
  constructor() {
    super('voluntarios');
  }

  // Sobrescreve create para usar o endpoint público de cadastro
  // (POST /voluntarios/cadastro, @Public() no backend) em vez de
  // POST /voluntarios que exige JWT e retornaria 401 para usuários não logados.
  override async create(payload: CreateVoluntarioDto): Promise<ResponseVoluntarioDto> {
    const response = await apiClient.post<{ data: ResponseVoluntarioDto }>(
      '/voluntarios/cadastro',
      payload,
    );
    return response.data.data;
  }
}

export const VoluntariosApi = new VoluntariosApiClass();
