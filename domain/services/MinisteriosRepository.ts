import { MinisteriosApi } from '../api/MinisteriosApi';
import { Ministerio } from '../models/Ministerio';
import { BaseRepository } from './BaseRepository';

class MinisteriosRepositoryClass extends BaseRepository<Ministerio> {
  constructor() {
    super(MinisteriosApi);
  }

  add(data: Omit<Ministerio, 'id' | 'createdAt' | 'updatedAt'>): Promise<Ministerio> {
    return MinisteriosApi.create(data, data.uploadLogo);
  }

  update(id: string, data: Partial<Ministerio>): Promise<Ministerio> {
    return MinisteriosApi.update(id, data, data.uploadLogo);
  }
}

export const MinisteriosRepository = new MinisteriosRepositoryClass();
