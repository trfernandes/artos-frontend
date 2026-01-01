import { BaseApi } from './BaseApi';
import { EscalaSubstituicaoApiModel } from '../models/EscalaSubstituicao';

class EscalaSubstituicoesApiClass extends BaseApi<EscalaSubstituicaoApiModel> {
  constructor() {
    super('escalas/substituicoes');
  }
}

export const EscalaSubstituicoesApi = new EscalaSubstituicoesApiClass();
