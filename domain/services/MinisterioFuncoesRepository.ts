import { MinisterioFuncoesApi } from '../api/MinisterioFuncoesApi';
import { MinisterioFuncaoApiModel, MinisterioFuncaoModel, MinisterioFuncaoSerializer } from '../models/MinisterioFuncao';
import { BaseRepository } from './BaseRepository';

class MinisterioFuncoesRepositoryClass extends BaseRepository<MinisterioFuncaoModel, MinisterioFuncaoApiModel> {
    constructor() {
        super(MinisterioFuncoesApi, {
            fromApi: MinisterioFuncaoSerializer.fromApi,
            toApi: MinisterioFuncaoSerializer.toApi,
        });
    }
}

export const MinisterioFuncoesRepository = new MinisterioFuncoesRepositoryClass();
