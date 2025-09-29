import { VoluntariosApi } from '../api/VoluntariosApi';
import { Voluntario } from '../models/Voluntario';
import { BaseRepository } from './BaseRepository';

class VoluntariosRepositoryClass extends BaseRepository<Voluntario> {
  constructor() {
    super(VoluntariosApi);
  }

  update(id: string, data: Partial<Voluntario>): Promise<Voluntario> {
    return VoluntariosApi.update(id, data, data.uploadFoto);
  }
}

export const VoluntariosRepository = new VoluntariosRepositoryClass();
