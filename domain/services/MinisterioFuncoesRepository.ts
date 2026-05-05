import { MinisterioFuncoesApi } from '../api/MinisterioFuncoesApi';
import { CreateMinisterioFuncaoDto } from '../dtos/MinisterioFuncao/ministerio-funcao.create';
import { ResponseMinisterioFuncaoDto } from '../dtos/MinisterioFuncao/ministerio-funcao.response';
import { UpdateMinisterioFuncaoDto } from '../dtos/MinisterioFuncao/ministerio-funcao.update';
import { BaseRepository } from './BaseRepository';

class MinisterioFuncoesRepositoryClass extends BaseRepository<
  ResponseMinisterioFuncaoDto,
  CreateMinisterioFuncaoDto,
  UpdateMinisterioFuncaoDto
> {
  constructor() {
    super(MinisterioFuncoesApi);
  }
}

export const MinisterioFuncoesRepository = new MinisterioFuncoesRepositoryClass();
