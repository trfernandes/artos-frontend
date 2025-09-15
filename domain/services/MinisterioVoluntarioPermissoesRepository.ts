import { MinisterioVoluntarioPermissoesApi } from '../api/MinisterioVoluntarioPermissoesApi';
import { MinisterioVoluntarioPermissao } from '../models/MinisterioVoluntarioPermissao';
import { BaseRepository } from './BaseRepository';

class MinisterioVoluntarioPermissoesRepositoryClass extends BaseRepository<MinisterioVoluntarioPermissao> {
  constructor() {
    super(MinisterioVoluntarioPermissoesApi);
  }
}

export const MinisterioVoluntarioPermissoesRepository = new MinisterioVoluntarioPermissoesRepositoryClass();
