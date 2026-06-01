import axios from 'axios';
import apiClient from './api-client';
import { strfyObj } from '../../utils/text_utils';
import { DynamicQuery } from '../utils/query_utils';

type ApiEnvelope<T> = {
  data: T;
  // se sua API tiver mais campos, adicione aqui (message, meta, etc)
};

export class BaseApi<TResponse, TCreate = unknown, TUpdate = unknown> {
  protected resourceName: string;

  constructor(resourceName: string) {
    this.resourceName = resourceName;
  }

  private logAxiosError(context: string, error: unknown, params?: any) {
    if (!axios.isAxiosError(error)) {
      console.error(`[BaseApi] Erro inesperado em ${context}:`, error);
      return;
    }

    const errorInfo = {
      context,
      mensagem: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      metodo: error.config?.method,
      params: params ?? {},
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
    };

    console.log('[BaseApi] AxiosError:', strfyObj(errorInfo));
  }

  async getAll(query?: any): Promise<TResponse[]> {
    try {
      const response = await apiClient.get<ApiEnvelope<TResponse[]>>(`/${this.resourceName}`, {
        params: query,
      });
      console.log(
        'Class: BaseApi',
        '\n',
        'Method: getAll',
        '\n',
        'params:',
        strfyObj(query),
        '\n',
        'data:',
        strfyObj(response.data.data),
      );
      return response.data.data;
    } catch (error) {
      this.logAxiosError('getAll', error, query);
      throw error;
    }
  }

  async getById(id: string): Promise<TResponse> {
    try {
      const response = await apiClient.get<ApiEnvelope<TResponse>>(`/${this.resourceName}/${id}`);
      return response.data.data;
    } catch (error) {
      this.logAxiosError('getById', error, { id });
      throw error;
    }
  }

  async search(query: DynamicQuery): Promise<TResponse[]> {
    try {
      const response = await apiClient.post<ApiEnvelope<TResponse[]>>(
        `/${this.resourceName}/search`,
        query,
      );
      return response.data.data;
    } catch (error) {
      this.logAxiosError('search', error, query);
      throw error;
    }
  }

  async create(payload: TCreate): Promise<TResponse> {
    try {
      const response = await apiClient.post<ApiEnvelope<TResponse>>(
        `/${this.resourceName}`,
        payload,
      );
      return response.data.data;
    } catch (error) {
      this.logAxiosError('create', error, payload);
      throw error;
    }
  }

  async update(id: string, payload: TUpdate): Promise<TResponse> {
    try {
      const response = await apiClient.put<ApiEnvelope<TResponse>>(
        `/${this.resourceName}/${id}`,
        payload,
      );
      return response.data.data;
    } catch (error) {
      this.logAxiosError('update', error, { id, payload });
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await apiClient.delete(`/${this.resourceName}/${id}`);
    } catch (error) {
      this.logAxiosError('delete', error, { id });
      throw error;
    }
  }
}
