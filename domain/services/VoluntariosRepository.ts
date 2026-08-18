import { VoluntariosApi } from '../api/VoluntariosApi';
import { ResponseVoluntarioDto } from '../dtos/Voluntario/voluntario.response';
import { CreateVoluntarioDto } from '../dtos/Voluntario/voluntario.create';
import { UpdateVoluntarioDto } from '../dtos/Voluntario/voluntario.update';
import { BaseRepository } from './BaseRepository';
import { DynamicQuery } from '../utils/query_utils';

class VoluntariosRepositoryClass extends BaseRepository<
  ResponseVoluntarioDto,
  CreateVoluntarioDto,
  UpdateVoluntarioDto
> {
  constructor() {
    super(VoluntariosApi);
  }

  // POST /voluntarios/search exige igrejaId como query param (escopo por igreja) —
  // ver VoluntariosApi.search.
  search(query: DynamicQuery, igrejaId?: string): Promise<ResponseVoluntarioDto[]> {
    return VoluntariosApi.search(query, igrejaId);
  }
}

export const VoluntariosRepository = new VoluntariosRepositoryClass();
