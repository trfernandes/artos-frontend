import { EscalaItensApi as EscalaItensApi } from '../api/EscalaItensApi';
import { GetEscalaItensVoluntarioQueryDto } from '../dtos/Escala/get-escala-itens-voluntario.query';
import { ResponseEscalaItemDto } from '../dtos/Escala/escala-item.response';
import { DynamicQuery } from '../utils/query_utils';
import { BaseRepository } from './BaseRepository';

class EscalaItensRepositoryClass extends BaseRepository<ResponseEscalaItemDto, any, any> {
  constructor() {
    super(EscalaItensApi);
  }

  async search(
    query: DynamicQuery,
    includeFotos: boolean = false,
  ): Promise<ResponseEscalaItemDto[]> {
    return EscalaItensApi.search(query, includeFotos);
  }

  async getByVoluntarioId(
    voluntarioId: string,
    query: GetEscalaItensVoluntarioQueryDto,
  ): Promise<ResponseEscalaItemDto[]> {
    return EscalaItensApi.getByVoluntarioId(voluntarioId, query);
  }

  async removeWithIgrejaId(id: string, igrejaId: string): Promise<void> {
    return EscalaItensApi.deleteWithIgrejaId(id, igrejaId);
  }
}

export const EscalaItensRepository = new EscalaItensRepositoryClass();
