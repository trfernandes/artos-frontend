import { CreateMinisterioFuncaoDto } from '../dtos/MinisterioFuncao/ministerio-funcao.create';
import { ResponseMinisterioFuncaoDto } from '../dtos/MinisterioFuncao/ministerio-funcao.response';
import { UpdateMinisterioFuncaoDto } from '../dtos/MinisterioFuncao/ministerio-funcao.update';
import { BaseApi } from './BaseApi';

class MinisterioFuncoesApiClass extends BaseApi<
  ResponseMinisterioFuncaoDto,
  CreateMinisterioFuncaoDto,
  UpdateMinisterioFuncaoDto
> {
  constructor() {
    super('ministerio-funcoes');
  }
}

export const MinisterioFuncoesApi = new MinisterioFuncoesApiClass();
