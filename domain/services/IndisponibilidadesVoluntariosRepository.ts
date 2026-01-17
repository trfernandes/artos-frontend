import { IndisponibilidadesVoluntariosApi } from '../api/IndisponibilidadesVoluntariosApi';
import { CreateIndisponibilidadeVoluntarioDto } from '../dtos/IndisponibilidadeVoluntario/indisponibilidade-voluntario.create';
import { ResponseIndisponibilidadeVoluntarioDto } from '../dtos/IndisponibilidadeVoluntario/indisponibilidade-voluntario.response';
import { UpdateIndisponibilidadeVoluntarioDto } from '../dtos/IndisponibilidadeVoluntario/indisponibilidade-voluntario.update';
import { UpsertIndisponibilidadesVoluntarioDto } from '../dtos/IndisponibilidadeVoluntario/upsert-indisponibilidades-voluntario.dto';
import { BaseRepository } from './BaseRepository';

class IndisponibilidadesVoluntariosRepositoryClass extends BaseRepository<
  ResponseIndisponibilidadeVoluntarioDto,
  CreateIndisponibilidadeVoluntarioDto,
  UpdateIndisponibilidadeVoluntarioDto
> {
  constructor() {
    super(IndisponibilidadesVoluntariosApi);
  }

  upsertMany(payload: UpsertIndisponibilidadesVoluntarioDto) {
    return IndisponibilidadesVoluntariosApi.upsertMany(payload);
  }
}

export const IndisponibilidadesVoluntariosRepository = new IndisponibilidadesVoluntariosRepositoryClass();
