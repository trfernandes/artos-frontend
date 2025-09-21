import { Identifiable } from '../models/Indentifiable';
import { DynamicQuery } from '../utils/query_utils';
import apiClient from './api-client';

export class BaseApi<T extends Identifiable> {
  private resourceName: string;

  constructor(resourceName: string) {
    this.resourceName = resourceName;
  }

  async getAll(query?: any): Promise<T[]> {
    try {
      const response = await apiClient.get(`/${this.resourceName}`, { params: query });
      return response.data.data;
    } catch (error) {
      console.error(`Erro ao buscar ${this.resourceName}:`, error);
      throw error;
    }
  }

  async getById(id: string): Promise<T> {
    try {
      const response = await apiClient.get(`/${this.resourceName}/${id}`);
      return response.data.data;
    } catch (error) {
      console.error(`Erro ao buscar ${this.resourceName} ${id}:`, error);
      throw error;
    }
  }

  async search(query: DynamicQuery): Promise<T[]> {
    try {
      const response = await apiClient.post(`/${this.resourceName}/search`, query);
      return response.data.data;
    } catch (error) {
      console.error(`Erro ao buscar ${this.resourceName} com query:`, error);
      throw error;
    }
  }

  async create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T> {
    try {
      const response = await apiClient.post(`/${this.resourceName}`, data);
      return response.data.data;
    } catch (error) {
      console.error(`Erro ao criar ${this.resourceName}:`, error);
      throw error;
    }
  }

  async update(id: string, data: Partial<Omit<T, 'id' | 'createdAt' | 'updatedAt'>>): Promise<T> {
    try {
      const response = await apiClient.put(`/${this.resourceName}/${id}`, data);
      return response.data.data;
    } catch (error) {
      console.error(`Erro ao atualizar ${this.resourceName} ${id}:`, error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await apiClient.delete(`/${this.resourceName}/${id}`);
    } catch (error) {
      console.error(`Erro ao excluir ${this.resourceName} ${id}:`, error);
      throw error;
    }
  }
}
