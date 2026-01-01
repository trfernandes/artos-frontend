import { MinisterioVoluntarioFuncaoApiModel } from '../models/MinisterioVoluntarioFuncao';
import { BaseApi } from './BaseApi';

export const apiName = 'ministerio-voluntario-funcoes';

class MinisterioVoluntarioFuncoesApiClass extends BaseApi<MinisterioVoluntarioFuncaoApiModel> {
  constructor() {
    super(apiName);
  }
}

export const MinisterioVoluntarioFuncoesApi = new MinisterioVoluntarioFuncoesApiClass();
