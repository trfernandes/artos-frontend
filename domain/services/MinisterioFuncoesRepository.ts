import { MinisterioFuncoesApi } from '../api/MinisterioFuncoesApi';
import { MinisterioFuncao } from '../models/MinisterioFuncao';
import { BaseRepository } from './BaseRepository';

class MinisterioFuncoesRepositoryClass extends BaseRepository<MinisterioFuncao> {
  constructor() {
    super(MinisterioFuncoesApi);
  }
}

export const MinisterioFuncoesRepository = new MinisterioFuncoesRepositoryClass();
