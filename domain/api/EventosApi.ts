import { Evento } from '../models/Evento';
import { BaseApi } from './BaseApi';
import apiClient from './api-client';

interface EventosIntervaloQuery {
  dataInicio: string;
  dataTermino: string;
}

class EventosApiClass extends BaseApi<Evento> {
  constructor() {
    super('eventos');
  }

  async buscarPorIntervalo(params: EventosIntervaloQuery): Promise<Evento[]> {
    try {
      const response = await apiClient.get(`/${this.resourceName}/intervalo`, { params });
      return response.data?.data ?? response.data;
    } catch (error) {
      console.log('Erro ao buscar eventos por intervalo:', error);
      throw error;
    }
  }
}

export const EventosApi = new EventosApiClass();
