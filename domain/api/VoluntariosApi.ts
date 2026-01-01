import { VoluntarioApiModel } from '../models/Voluntario';
import apiClient from './api-client';
import { BaseApi } from './BaseApi';

class VoluntariosApiClass extends BaseApi<VoluntarioApiModel> {
  constructor() {
    super('voluntarios');
  }

  async update(id: string, data: Partial<VoluntarioApiModel>, foto?: string | null): Promise<VoluntarioApiModel> {
    try {
      const formData = new FormData();

      Object.entries(data).forEach(([key, value]) => {
        if (key === 'foto') return;

        if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });

      if (foto) {
        formData.append('foto', {
          uri: foto,
          name: 'voluntario_foto.jpg',
          type: 'image/jpeg',
        } as any);
      } else {
        formData.append('foto', 'null');
      }

      const response = await apiClient.put(`/${'voluntarios'}/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data.data;
    } catch (error) {
      console.log(`Erro ao atualizar ${'voluntarios'} ${id}:`, error);
      throw error;
    }
  }
}

export const VoluntariosApi = new VoluntariosApiClass();
