import { BaseApi } from './BaseApi';
import { EscalaSubstituicao } from '../models/EscalaSubstituicao';

class EscalaSubstituicoesApiClass extends BaseApi<EscalaSubstituicao> {
  constructor() {
    super('escalas/substituicoes');
  }
}

export const EscalaSubstituicoesApi = new EscalaSubstituicoesApiClass();
