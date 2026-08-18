import { CreateVoluntarioDto } from '../dtos/Voluntario/voluntario.create';
import { ResponseVoluntarioDto } from '../dtos/Voluntario/voluntario.response';
import { UpdateVoluntarioDto } from '../dtos/Voluntario/voluntario.update';
import { BaseApi } from './BaseApi';
import apiClient from './api-client';
import { DynamicQuery } from '../utils/query_utils';

type ApiEnvelope<T> = { data: T };

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

  // Sobrescreve search para exigir igrejaId como query param — o controller
  // (POST /voluntarios/search) escopa por igreja e rejeita a request com 400
  // ("O ID deve ser um UUID válido.") quando igrejaId não vem na query.
  override async search(query: DynamicQuery, igrejaId?: string): Promise<ResponseVoluntarioDto[]> {
    try {
      const response = await apiClient.post<ApiEnvelope<ResponseVoluntarioDto[]>>(
        '/voluntarios/search',
        query,
        { params: igrejaId ? { igrejaId } : undefined },
      );
      return response.data.data;
    } catch (error) {
      this.logAxiosError('search', error, query);
      throw error;
    }
  }
}

export const VoluntariosApi = new VoluntariosApiClass();
