import axios from 'axios';
import { Identifiable } from '../models/Indentifiable';
import { DynamicQuery } from '../utils/query_utils';
import apiClient from './api-client';
import { strfyObj } from '../../utils/text_utils';

export class BaseApi<T extends Identifiable> {
  protected resourceName: string;

  constructor(resourceName: string) {
    this.resourceName = resourceName;
  }

  async getAll(query?: any): Promise<T[]> {
    try {
      const response = await apiClient.get(`/${this.resourceName}`, { params: query });
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
      const start = Date.now();
      const response = await apiClient.post(`/${this.resourceName}/search`, query);
      console.log(`${this.constructor.name}.Search => Tempo:`, `${Date.now() - start} ms`);
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
    try {
      const response = await apiClient.post(`/${this.resourceName}`, data);
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
              return typeof error.config?.data === 'string' ? JSON.parse(error.config.data) : error.config?.data;
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
