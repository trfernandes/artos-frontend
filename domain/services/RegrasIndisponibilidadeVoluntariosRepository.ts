import { RegrasIndisponibilidadeVoluntariosApi } from '../api/RegrasIndisponibilidadeVoluntariosApi';
import { CreateRegraIndisponibilidadeVoluntarioDto } from '../dtos/RegraIndisponibilidadeVoluntario/regra-indisponibilidade-voluntario.create';
import { ResponseRegraIndisponibilidadeVoluntarioDto } from '../dtos/RegraIndisponibilidadeVoluntario/regra-indisponibilidade-voluntario.response';
import { UpdateRegraIndisponibilidadeVoluntarioDto } from '../dtos/RegraIndisponibilidadeVoluntario/regra-indisponibilidade-voluntario.update';
import { BaseRepository } from './BaseRepository';

class RegrasIndisponibilidadeVoluntariosRepositoryClass extends BaseRepository<
  ResponseRegraIndisponibilidadeVoluntarioDto,
  CreateRegraIndisponibilidadeVoluntarioDto,
  UpdateRegraIndisponibilidadeVoluntarioDto
> {
  constructor() {
    super(RegrasIndisponibilidadeVoluntariosApi);
  }

  update(
    id: string,
    payload: UpdateRegraIndisponibilidadeVoluntarioDto,
    igrejaId?: string,
  ): Promise<ResponseRegraIndisponibilidadeVoluntarioDto> {
    return RegrasIndisponibilidadeVoluntariosApi.update(id, payload, igrejaId);
  }

  remove(id: string, igrejaId?: string): Promise<void> {
    return RegrasIndisponibilidadeVoluntariosApi.delete(id, igrejaId);
  }
}

export const RegrasIndisponibilidadeVoluntariosRepository =
  new RegrasIndisponibilidadeVoluntariosRepositoryClass();
