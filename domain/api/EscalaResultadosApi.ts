import axios from 'axios';
import { EscalaResultado } from '../models/EscalaResultado';
import apiClient from './api-client';
import { BaseApi } from './BaseApi';
import { strfyObj } from '../../utils/text_utils';

class EscalaResultadosApiClass extends BaseApi<EscalaResultado> {
  constructor() {
    super('escalas/resultados');
  }

  async getByVoluntarioId(voluntarioId: string): Promise<EscalaResultado[]> {
    try {
      const response = await apiClient.get(`/${this.resourceName}/voluntario/${voluntarioId}`);
      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorInfo = {
          mensagem: error.message,
          status: error.response?.status,
          statusText: error.response?.statusText,
          url: error.config?.url,
          metodo: error.config?.method,
          dadosEnviados: (() => {
            try {
              return typeof error.config?.data === 'string' ? JSON.parse(error.config.data) : error.config?.data;
            } catch {
              return error.config?.data;
            }
          })(),
          resposta: error.response?.data,
          params: { voluntarioId },
        };
        console.log('Erro ao buscar por Id de voluntário:', strfyObj(errorInfo));
      } else {
        console.error('Erro inesperado:', error);
      }
      throw error;
    }
  }
}

export const EscalaResultadosApi = new EscalaResultadosApiClass();
