import { MinisterioVoluntariosApi } from '../api/MinisterioVoluntariosApi';
import { MinisterioVoluntarioApiModel, MinisterioVoluntarioModel, MinisterioVoluntarioSerializer } from '../models/MinisterioVoluntario';
import { BaseRepository } from './BaseRepository';

class MinisterioVoluntariosRepositoryClass extends BaseRepository<MinisterioVoluntarioModel, MinisterioVoluntarioApiModel> {
  constructor() {
    super(MinisterioVoluntariosApi, { fromApi: MinisterioVoluntarioSerializer.fromApi, toApi: MinisterioVoluntarioSerializer.toApi });
  }
}

export const MinisterioVoluntariosRepository = new MinisterioVoluntariosRepositoryClass();
