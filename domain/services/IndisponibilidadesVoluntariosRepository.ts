import { IndisponibilidadesVoluntariosApi as IndisponibilidadesVoluntarioApi } from '../api/IndisponibilidadesVoluntariosApi';
import { IndisponibilidadeVoluntario } from '../models/IndisponibilidadeVoluntario';
import { BaseRepository } from './BaseRepository';

class IndisponibilidadesVoluntariosRepositoryClass extends BaseRepository<IndisponibilidadeVoluntario> {
  constructor() {
    super(IndisponibilidadesVoluntarioApi);
  }
}

export const IndisponibilidadesVoluntarioRepository = new IndisponibilidadesVoluntariosRepositoryClass();
