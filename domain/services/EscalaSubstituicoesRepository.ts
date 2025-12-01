import { EscalaSubstituicoesApi } from '../api/EscalaSubstituicoesApi';
import { EscalaSubstituicao } from '../models/EscalaSubstituicao';
import { BaseRepository } from './BaseRepository';

class EscalaSubstituicoesRepositoryClass extends BaseRepository<EscalaSubstituicao> {
  constructor() {
    super(EscalaSubstituicoesApi);
  }
}

export const EscalaSubstituicoesRepository = new EscalaSubstituicoesRepositoryClass();
