import { MinisterioVoluntariosApi } from '../api/MinisterioVoluntariosApi';
import { CreateMinisterioVoluntarioDto } from '../dtos/MinisterioVoluntario/ministerio-voluntario.create';
import { ResponseMinisterioVoluntarioDto } from '../dtos/MinisterioVoluntario/ministerio-voluntario.response';
import { UpdateMinisterioVoluntarioDto } from '../dtos/MinisterioVoluntario/ministerio-voluntario.update';
import { BaseRepository } from './BaseRepository';

class MinisterioVoluntariosRepositoryClass extends BaseRepository<
  ResponseMinisterioVoluntarioDto,
  CreateMinisterioVoluntarioDto,
  UpdateMinisterioVoluntarioDto
> {
  constructor() {
    super(MinisterioVoluntariosApi);
  }
}

export const MinisterioVoluntariosRepository = new MinisterioVoluntariosRepositoryClass();
