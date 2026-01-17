import axios from 'axios';
import apiClient from './api-client';
import { BaseApi } from './BaseApi';
import { strfyObj } from '../../utils/text_utils';
import { DynamicQuery } from '../utils/query_utils';
import { CreateEscalaItemDto } from '../dtos/Escala/escala-item.create';
import { ResponseEscalaItemDto } from '../dtos/Escala/escala-item.response';
import { UpdateEscalaItemDto } from '../dtos/Escala/escala-item.update';

class EscalaItensApiClass extends BaseApi<ResponseEscalaItemDto, CreateEscalaItemDto, UpdateEscalaItemDto> {
  constructor() {
    super('escalas/itens');
  }

  override async search(query: DynamicQuery, includeFotos: boolean = false): Promise<ResponseEscalaItemDto[]> {
    try {
      const response = await apiClient.post(`/${this.resourceName}/search`, query, { params: { includeFotos } });
      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.log('Erro ao buscar:', strfyObj(error, 300));
      } else {
        console.error('Erro inesperado:', error);
      }
      throw error;
    }
  }

  async getByVoluntarioId(voluntarioId: string): Promise<ResponseEscalaItemDto[]> {
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

export const EscalaItensApi = new EscalaItensApiClass();
