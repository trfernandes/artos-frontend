import { CreateMinisterioVoluntarioFuncaoDto } from '../dtos/MinisterioVoluntarioFuncao/ministerio-voluntario-funcao.create';
import { ResponseMinisterioVoluntarioFuncaoDto } from '../dtos/MinisterioVoluntarioFuncao/ministerio-voluntario-funcao.response';
import { UpdateMinisterioVoluntarioFuncaoDto } from '../dtos/MinisterioVoluntarioFuncao/ministerio-voluntario-funcao.update';
import { BaseApi } from './BaseApi';

export const apiName = 'ministerio-voluntario-funcoes';

class MinisterioVoluntarioFuncoesApiClass extends BaseApi<
  ResponseMinisterioVoluntarioFuncaoDto,
  CreateMinisterioVoluntarioFuncaoDto,
  UpdateMinisterioVoluntarioFuncaoDto
> {
  constructor() {
    super(apiName);
  }
}

export const MinisterioVoluntarioFuncoesApi = new MinisterioVoluntarioFuncoesApiClass();
