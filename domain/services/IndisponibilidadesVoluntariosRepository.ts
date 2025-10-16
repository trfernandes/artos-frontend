import { IndisponibilidadesVoluntariosApi as IndisponibilidadesVoluntarioApi } from '../api/IndisponibilidadesVoluntariosApi';
import {
  IndisponibilidadeVoluntario,
  UpsertIndisponibilidadesVoluntarioPayload,
} from '../models/IndisponibilidadeVoluntario';
import { BaseRepository } from './BaseRepository';

class IndisponibilidadesVoluntariosRepositoryClass extends BaseRepository<IndisponibilidadeVoluntario> {
  constructor() {
    super(IndisponibilidadesVoluntarioApi);
  }

  upsertMany(payload: UpsertIndisponibilidadesVoluntarioPayload) {
    return IndisponibilidadesVoluntarioApi.upsertMany(payload);
  }
}

export const IndisponibilidadesVoluntarioRepository = new IndisponibilidadesVoluntariosRepositoryClass();
