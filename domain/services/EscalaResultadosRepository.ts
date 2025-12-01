import { EscalaResultadosApi } from '../api/EscalaResultadosApi';
import { EscalaResultado } from '../models/EscalaResultado';
import { BaseRepository } from './BaseRepository';

class EscalaResultadosRepositoryClass extends BaseRepository<EscalaResultado> {
  constructor() {
    super(EscalaResultadosApi);
  }

  getByVoluntarioId(voluntarioId: string): Promise<EscalaResultado[]> {
    return EscalaResultadosApi.getByVoluntarioId(voluntarioId);
  }
}

export const EscalaResultadosRepository = new EscalaResultadosRepositoryClass();
