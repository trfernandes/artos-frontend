import { IndisponibilidadeVoluntario } from '../models/IndisponibilidadeVoluntario';
import { BaseApi } from './BaseApi';

class IndisponibilidadesVoluntariosApiClass extends BaseApi<IndisponibilidadeVoluntario> {
  constructor() {
    super('indisponibilidades-voluntarios');
  }
}

export const IndisponibilidadesVoluntariosApi = new IndisponibilidadesVoluntariosApiClass();
