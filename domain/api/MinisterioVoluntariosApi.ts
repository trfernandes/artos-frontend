import { MinisterioVoluntario } from '../models/MinisterioVoluntario';
import { BaseApi } from './BaseApi';

class MinisterioVoluntariosApiClass extends BaseApi<MinisterioVoluntario> {
  constructor() {
    super('ministerio-voluntarios');
  }
}

export const MinisterioVoluntariosApi = new MinisterioVoluntariosApiClass();
