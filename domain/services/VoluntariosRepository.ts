import { VoluntariosApi } from '../api/VoluntariosApi';
import { Voluntario } from '../models/Voluntario';
import { BaseRepository } from './BaseRepository';

class VoluntariosRepositoryClass extends BaseRepository<Voluntario> {
  constructor() {
    super(VoluntariosApi);
  }
}

export const VoluntariosRepository = new VoluntariosRepositoryClass();
