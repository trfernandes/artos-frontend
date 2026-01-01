import axios from 'axios';
import { BaseApiModel } from '../models/BaseModel';
import { DynamicQuery } from '../utils/query_utils';
import { strfyObj } from '../../utils/text_utils';
import apiClient from './api-client';

export class BaseApi<T extends BaseApiModel> {
  protected resourceName: string;

  constructor(resourceName: string) {
    this.resourceName = resourceName;
  }

  async getAll(query?: any): Promise<T[]> {
    try {
      const response = await apiClient.get(`/${this.resourceName}`, { params: query });
      console.log(
        'Class: BaseApi',
        '\n',
        'Method: getAll',
        '\n',
        'params:',
        strfyObj(query),
        '\n',
        'data:',
        strfyObj(response.data.data)
      );
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
              return typeof error.config?.data === 'string'
                ? JSON.parse(error.config.data)
                : error.config?.data;
            } catch {
              return error.config?.data;
            }
          })(),
          resposta: error.response?.data,
          params: {},
        };
        console.log('Erro ao buscar todos registros:', strfyObj(errorInfo));
      } else {
        console.error('Erro inesperado:', error);
      }
      throw error;
    }
  }

  async getById(id: string): Promise<T> {
    try {
      const response = await apiClient.get(`/${this.resourceName}/${id}`);
      console.log(
        'Class: BaseApi',
        '\n',
        'Method: getById',
        '\n',
        'params:',
        strfyObj({ id }),
        '\n',
        'data:',
        strfyObj(response.data.data)
      );
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
              return typeof error.config?.data === 'string'
                ? JSON.parse(error.config.data)
                : error.config?.data;
            } catch {
              return error.config?.data;
            }
          })(),
          resposta: error.response?.data,
          params: { id },
        };
        console.log('Erro ao buscar por Id:', strfyObj(errorInfo));
      } else {
        console.error('Erro inesperado:', error);
      }
      throw error;
    }
  }

  async search(query: DynamicQuery): Promise<T[]> {
    try {
      const response = await apiClient.post(`/${this.resourceName}/search`, query);
      console.log(
        'Class: BaseApi',
        '\n',
        'Method: search',
        '\n',
        'params:',
        strfyObj(query),
        '\n',
        'data:',
        strfyObj(response.data.data)
      );
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

  async create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T> {
    console.log('Entrou no create do BaseApi');
    try {
      const response = await apiClient.post(`/${this.resourceName}`, data);
      console.log(
        'Class: BaseApi',
        '\n',
        'Method: create',
        '\n',
        'params:',
        strfyObj(data),
        '\n',
        'data:',
        strfyObj(response.data.data)
      );
      return response.data.data;
    } catch (error) {
      console.log('Entrou no catch do create');
      if (axios.isAxiosError(error)) {
        const errorInfo = {
          mensagem: error.message,
          status: error.response?.status,
          statusText: error.response?.statusText,
          url: error.config?.url,
          metodo: error.config?.method,
          dadosEnviados: (() => {
            try {
              return typeof error.config?.data === 'string'
                ? JSON.parse(error.config.data)
                : error.config?.data;
            } catch {
              return error.config?.data;
            }
          })(),
          resposta: error.response?.data,
          params: { data },
        };
        console.log('Erro ao adicionar:', strfyObj(errorInfo));
      } else {
        console.error('Erro inesperado:', error);
      }
      throw error;
    }
  }

  async update(id: string, data: Partial<Omit<T, 'id' | 'createdAt' | 'updatedAt'>>): Promise<T> {
    try {
      const response = await apiClient.put(`/${this.resourceName}/${id}`, data);
      console.log(
        'Class: BaseApi',
        '\n',
        'Method: update',
        '\n',
        'params:',
        strfyObj({ id, data }),
        '\n',
        'data:',
        strfyObj(response.data.data)
      );
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
              return typeof error.config?.data === 'string'
                ? JSON.parse(error.config.data)
                : error.config?.data;
            } catch {
              return error.config?.data;
            }
          })(),
          resposta: error.response?.data,
          params: { id, data },
        };
        console.log('Erro ao atualizar:', strfyObj(errorInfo));
      } else {
        console.error('Erro inesperado:', error);
      }
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await apiClient.delete(`/${this.resourceName}/${id}`);
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
              return typeof error.config?.data === 'string'
                ? JSON.parse(error.config.data)
                : error.config?.data;
            } catch {
              return error.config?.data;
            }
          })(),
          resposta: error.response?.data,
          params: { id },
        };
        console.log('Erro ao excluir:', strfyObj(errorInfo));
      } else {
        console.error('Erro inesperado:', error);
      }
      throw error;
    }
  }
}
