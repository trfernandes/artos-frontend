import { MinisterioFuncaoApiModel } from '../models/MinisterioFuncao';
import { BaseApi } from './BaseApi';

class MinisterioFuncoesApiClass extends BaseApi<MinisterioFuncaoApiModel> {
  constructor() {
    super('ministerio-funcoes');
  }
}

export const MinisterioFuncoesApi = new MinisterioFuncoesApiClass();
