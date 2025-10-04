import { MinisterioFuncao } from '../models/MinisterioFuncao';
import { BaseApi } from './BaseApi';

class MinisterioFuncoesApiClass extends BaseApi<MinisterioFuncao> {
  constructor() {
    super('ministerio-funcoes');
  }
}

export const MinisterioFuncoesApi = new MinisterioFuncoesApiClass();
