import { MinisterioVoluntarioPermissoesApi } from '../api/MinisterioVoluntarioPermissoesApi';
import {
  MinisterioVoluntarioPermissaoApiModel,
  MinisterioVoluntarioPermissaoModel,
  MinisterioVoluntarioPermissaoSerializer,
} from '../models/MinisterioVoluntarioPermissao';
import { BaseRepository } from './BaseRepository';

class MinisterioVoluntarioPermissoesRepositoryClass extends BaseRepository<
  MinisterioVoluntarioPermissaoModel,
  MinisterioVoluntarioPermissaoApiModel
> {
  constructor() {
    super(MinisterioVoluntarioPermissoesApi, {
      fromApi: MinisterioVoluntarioPermissaoSerializer.fromApi,
      toApi: MinisterioVoluntarioPermissaoSerializer.toApi,
    });
  }
}

export const MinisterioVoluntarioPermissoesRepository = new MinisterioVoluntarioPermissoesRepositoryClass();
