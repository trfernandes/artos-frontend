import { MinisterioVoluntarioPermissaoApiModel } from '../models/MinisterioVoluntarioPermissao';
import { BaseApi } from './BaseApi';

class MinisterioVoluntarioPermissoesApiClass extends BaseApi<MinisterioVoluntarioPermissaoApiModel> {
  constructor() {
    super('ministerio-voluntario-permissoes');
  }
}

export const MinisterioVoluntarioPermissoesApi = new MinisterioVoluntarioPermissoesApiClass();
