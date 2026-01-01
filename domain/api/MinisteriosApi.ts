import { MinisterioApiModel } from '../models/Ministerio';
import apiClient from './api-client';
import { BaseApi } from './BaseApi';

class MinisteriosApiClass extends BaseApi<MinisterioApiModel> {
  constructor() {
    super('ministerios');
  }

  async create(data: Omit<MinisterioApiModel, 'id' | 'createdAt' | 'updatedAt'>, logo?: string | null): Promise<MinisterioApiModel> {
    try {
      const formData = new FormData();

      Object.entries(data).forEach(([key, value]) => {
        if (key === 'logo') return;

        if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });

      if (logo) {
        formData.append('logo', {
          uri: logo,
          name: 'logo.jpg',
          type: 'image/jpeg',
        } as any);
      } else {
        formData.append('logo', 'null');
      }

      const response = await apiClient.post(`/${'ministerios'}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data.data;
    } catch (error) {
      console.log(`Erro ao atualizar ${'ministerios'}: `, error);
      throw error;
    }
  }

  async update(id: string, data: Partial<MinisterioApiModel>, logo?: string | null): Promise<MinisterioApiModel> {
    try {
      const formData = new FormData();

      Object.entries(data).forEach(([key, value]) => {
        if (key === 'logo') return;

        if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });

      if (logo) {
        formData.append('logo', {
          uri: logo,
          name: 'logo.jpg',
          type: 'image/jpeg',
        } as any);
      } else {
        formData.append('logo', 'null');
      }

      const response = await apiClient.put(`/${'ministerios'}/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data.data;
    } catch (error) {
      console.log(`Erro ao atualizar ${'ministerios'} ${id}:`, error);
      throw error;
    }
  }
}

export const MinisteriosApi = new MinisteriosApiClass();
