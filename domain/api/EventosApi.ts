import { BaseApi } from './BaseApi';
import apiClient from './api-client';
import type { GetEventosIntervaloDto } from '../dtos/Evento/get-eventos-intervalo.dto';
import { CreateEventoDto } from '../dtos/Evento/evento.create';
import { ResponseEventoDto } from '../dtos/Evento/evento.response';
import { UpdateEventoDto } from '../dtos/Evento/evento.update';

class EventosApiClass extends BaseApi<ResponseEventoDto, CreateEventoDto, UpdateEventoDto> {
  constructor() {
    super('eventos');
  }

  async buscarPorIntervalo(params: GetEventosIntervaloDto): Promise<ResponseEventoDto[]> {
    try {
      const response = await apiClient.get(`/${this.resourceName}/intervalo`, {
        params,
      });
      return response.data?.data ?? response.data;
    } catch (error) {
      console.log('Erro ao buscar eventos por intervalo:', error);
      throw error;
    }
  }
}

export const EventosApi = new EventosApiClass();
