import { EscalaItensApi as EscalaItensApi } from '../api/EscalaItensApi';
import { EscalaItem } from '../models/EscalaItem';
import { DynamicQuery } from '../utils/query_utils';
import { BaseRepository } from './BaseRepository';

class EscalaItensRepositoryClass extends BaseRepository<EscalaItem> {
  constructor() {
    super(EscalaItensApi);
  }

  search(query: DynamicQuery, includeFotos: boolean = false): Promise<EscalaItem[]> {
   return EscalaItensApi.search(query, includeFotos);
  }

  getByVoluntarioId(voluntarioId: string): Promise<EscalaItem[]> {
    return EscalaItensApi.getByVoluntarioId(voluntarioId);
  }
}

export const EscalaItensRepository = new EscalaItensRepositoryClass();
