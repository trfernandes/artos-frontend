// src/services/base/BaseRepository.ts

import { BaseApi } from '../api/BaseApi';
import { Identifiable } from '../models/Indentifiable';
import { DynamicQuery } from '../utils/query_utils';

export class BaseRepository<T extends Identifiable> {
  private api: BaseApi<T>;

  constructor(api: BaseApi<T>) {
    this.api = api;
  }

  async getAll(query?: any): Promise<T[]> {
    return this.api.getAll(query);
  }

  async getById(id: string): Promise<T | null> {
    return this.api.getById(id);
  }

  async search(query: DynamicQuery): Promise<T[]> {
    return this.api.search(query);
  }

  async add(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T> {
    return this.api.create(data);
  }

  async update(id: string, data: Partial<Omit<T, 'id' | 'createdAt' | 'updatedAt'>>): Promise<T> {
    return this.api.update(id, data);
  }

  async remove(id: string): Promise<void> {
    return this.api.delete(id);
  }
}
