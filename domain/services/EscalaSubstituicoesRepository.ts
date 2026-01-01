import { EscalaSubstituicoesApi } from '../api/EscalaSubstituicoesApi';
import { EscalaSubstituicaoApiModel, EscalaSubstituicaoModel, EscalaSubstituicaoSerializer } from '../models/EscalaSubstituicao';
import { BaseRepository } from './BaseRepository';

class EscalaSubstituicoesRepositoryClass extends BaseRepository<EscalaSubstituicaoModel, EscalaSubstituicaoApiModel> {
  constructor() {
    super(EscalaSubstituicoesApi, { fromApi: EscalaSubstituicaoSerializer.fromApi, toApi: EscalaSubstituicaoSerializer.toApi });
  }
}

export const EscalaSubstituicoesRepository = new EscalaSubstituicoesRepositoryClass();
