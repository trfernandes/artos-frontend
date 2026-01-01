import { MinisteriosApi } from '../api/MinisteriosApi';
import { MinisterioApiModel, MinisterioModel, MinisterioSerializer } from '../models/Ministerio';
import { BaseRepository } from './BaseRepository';

class MinisteriosRepositoryClass extends BaseRepository<MinisterioModel, MinisterioApiModel> {
  constructor() {
    super(MinisteriosApi, { fromApi: MinisterioSerializer.fromApi, toApi: MinisterioSerializer.toApi });
  }

  async add(data: Omit<MinisterioModel, 'id' | 'createdAt' | 'updatedAt'>): Promise<MinisterioModel> {
    const apiData = MinisterioSerializer.toApi(data);
    const result = await MinisteriosApi.create(apiData, data.uploadLogo);
    return MinisterioSerializer.fromApi(result);
  }

  async update(id: string, data: Partial<MinisterioModel>): Promise<MinisterioModel> {
    const apiData = MinisterioSerializer.toApi(data);
    const result = await MinisteriosApi.update(id, apiData, data.uploadLogo);
    return MinisterioSerializer.fromApi(result);
  }
}

export const MinisteriosRepository = new MinisteriosRepositoryClass();
