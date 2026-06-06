import { BaseApi } from '../api/BaseApi';
import { DynamicQuery } from '../utils/query_utils';

export abstract class BaseRepository<TResponse, TCreate, TUpdate> {
  protected api: BaseApi<TResponse, TCreate, TUpdate>;

  constructor(api: BaseApi<TResponse, TCreate, TUpdate>) {
    this.api = api;
  }

  getAll(query?: any): Promise<TResponse[]> {
    return this.api.getAll(query);
  }

  getById(id: string): Promise<TResponse> {
    return this.api.getById(id);
  }

  search(query: DynamicQuery): Promise<TResponse[]> {
    return this.api.search(query);
  }

  add(payload: TCreate): Promise<TResponse> {
    return this.api.create(payload);
  }

  update(id: string, payload: TUpdate): Promise<TResponse> {
    return this.api.update(id, payload);
  }

  remove(id: string, igrejaId?: string): Promise<void> {
    return this.api.delete(id, igrejaId);
  }
}
