import { VoluntariosApi } from '../api/VoluntariosApi';
import { ResponseVoluntarioDto } from '../dtos/Voluntario/voluntario.response';
import { CreateVoluntarioDto } from '../dtos/Voluntario/voluntario.create';
import { UpdateVoluntarioDto } from '../dtos/Voluntario/voluntario.update';
import { BaseRepository } from './BaseRepository';

class VoluntariosRepositoryClass extends BaseRepository<
  ResponseVoluntarioDto,
  CreateVoluntarioDto,
  UpdateVoluntarioDto
> {
  constructor() {
    super(VoluntariosApi);
  }
}

export const VoluntariosRepository = new VoluntariosRepositoryClass();
