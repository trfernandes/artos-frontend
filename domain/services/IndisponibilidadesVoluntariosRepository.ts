import { IndisponibilidadesVoluntariosApi } from '../api/IndisponibilidadesVoluntariosApi';
import {
  IndisponibilidadeVoluntarioApiModel,
  IndisponibilidadeVoluntarioModel,
  IndisponibilidadeVoluntarioSerializer,
  UpsertIndisponibilidadesVoluntarioDto,
} from '../models/IndisponibilidadeVoluntario';
import { BaseRepository } from './BaseRepository';

class IndisponibilidadesVoluntariosRepositoryClass extends BaseRepository<
  IndisponibilidadeVoluntarioModel,
  IndisponibilidadeVoluntarioApiModel
> {
  constructor() {
    super(IndisponibilidadesVoluntariosApi, {
      fromApi: IndisponibilidadeVoluntarioSerializer.fromApi,
      toApi: IndisponibilidadeVoluntarioSerializer.toApi,
    });
  }

  protected fromApi(apiModel: IndisponibilidadeVoluntarioApiModel): IndisponibilidadeVoluntarioModel {
    return IndisponibilidadeVoluntarioSerializer.fromApi(apiModel);
  }

  protected toApi(model: IndisponibilidadeVoluntarioModel): IndisponibilidadeVoluntarioApiModel {
    return IndisponibilidadeVoluntarioSerializer.toApi(model);
  }

  upsertMany(payload: UpsertIndisponibilidadesVoluntarioDto) {
    return IndisponibilidadesVoluntariosApi.upsertMany(payload);
  }
}

export const IndisponibilidadesVoluntariosRepository = new IndisponibilidadesVoluntariosRepositoryClass();
