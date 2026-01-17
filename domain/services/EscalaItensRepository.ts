import { EscalaItensApi as EscalaItensApi } from '../api/EscalaItensApi';
import { ResponseEscalaItemDto } from '../dtos/Escala/escala-item.response';
import { DynamicQuery } from '../utils/query_utils';
import { BaseRepository } from './BaseRepository';

class EscalaItensRepositoryClass extends BaseRepository<ResponseEscalaItemDto, any, any> {
  constructor() {
    super(EscalaItensApi);
  }

  async search(query: DynamicQuery, includeFotos: boolean = false): Promise<ResponseEscalaItemDto[]> {
    return EscalaItensApi.search(query, includeFotos);
  }

  async getByVoluntarioId(voluntarioId: string): Promise<ResponseEscalaItemDto[]> {
    return EscalaItensApi.getByVoluntarioId(voluntarioId);
  }
}

export const EscalaItensRepository = new EscalaItensRepositoryClass();
