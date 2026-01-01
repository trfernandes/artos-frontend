import { EscalaItensApi as EscalaItensApi } from '../api/EscalaItensApi';
import { EscalaItemApiModel, EscalaItemModel, EscalaItemSerializer } from '../models/EscalaItem';
import { DynamicQuery } from '../utils/query_utils';
import { BaseRepository } from './BaseRepository';

class EscalaItensRepositoryClass extends BaseRepository<EscalaItemModel, EscalaItemApiModel> {
  constructor() {
    super(EscalaItensApi, { fromApi: EscalaItemSerializer.fromApi, toApi: EscalaItemSerializer.toApi });
  }

  async search(query: DynamicQuery, includeFotos: boolean = false): Promise<EscalaItemModel[]> {
    const result = await EscalaItensApi.search(query, includeFotos);
    return result.map(item => this.serializer.fromApi(item));
  }

  async getByVoluntarioId(voluntarioId: string): Promise<EscalaItemModel[]> {
    const result = await EscalaItensApi.getByVoluntarioId(voluntarioId);
    return result.map(item => this.serializer.fromApi(item));
  }
}

export const EscalaItensRepository = new EscalaItensRepositoryClass();
