import { MinisterioVoluntariosApi } from '../api/MinisterioVoluntariosApi';
import { MinisterioVoluntario } from '../models/MinisterioVoluntario';
import { BaseRepository } from './BaseRepository';

class MinisterioVoluntariosRepositoryClass extends BaseRepository<MinisterioVoluntario> {
  constructor() {
    super(MinisterioVoluntariosApi);
  }
}

export const MinisterioVoluntariosRepository = new MinisterioVoluntariosRepositoryClass();
