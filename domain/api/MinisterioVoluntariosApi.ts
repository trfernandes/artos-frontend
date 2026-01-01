import { MinisterioVoluntarioApiModel } from '../models/MinisterioVoluntario';
import { BaseApi } from './BaseApi';

class MinisterioVoluntariosApiClass extends BaseApi<MinisterioVoluntarioApiModel> {
  constructor() {
    super('ministerio-voluntarios');
  }
}

export const MinisterioVoluntariosApi = new MinisterioVoluntariosApiClass();
