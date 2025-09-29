import { Ministerio } from '../models/Ministerio';
import apiClient from './api-client';
import { BaseApi } from './BaseApi';
import * as FileSystem from 'expo-file-system';

export async function base64ToFile(base64: string, filename: string = 'temp.jpg') {
  const path = FileSystem.cacheDirectory + filename;

  const base64Data = base64.includes('base64,') ? base64.split('base64,')[1] : base64;

  await FileSystem.writeAsStringAsync(path, base64Data, {
    encoding: FileSystem.EncodingType.Base64,
  });

  return {
    uri: path, // Esse URI pode ser enviado no FormData
    name: filename,
    type: 'image/jpeg', // ajuste se precisar
  };
}

class MinisteriosApiClass extends BaseApi<Ministerio> {
  constructor() {
    super('ministerios');
  }

  async create(data: Omit<Ministerio, 'id' | 'createdAt' | 'updatedAt'>, logo?: string | null): Promise<Ministerio> {
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
      console.error(`Erro ao atualizar ${'ministerios'}: `, error);
      throw error;
    }
  }

  async update(id: string, data: Partial<Ministerio>, logo?: string | null): Promise<Ministerio> {
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
      console.error(`Erro ao atualizar ${'ministerios'} ${id}:`, error);
      throw error;
    }
  }
}

export const MinisteriosApi = new MinisteriosApiClass();
