import { CreateMinisterioVoluntarioPermissaoDto } from '../dtos/MinisterioVoluntarioPermissao/ministerio-voluntario-permissao.create';
import { ResponseMinisterioVoluntarioPermissaoDto } from '../dtos/MinisterioVoluntarioPermissao/ministerio-voluntario-permissao.response';
import { UpdateMinisterioVoluntarioPermissaoDto } from '../dtos/MinisterioVoluntarioPermissao/ministerio-voluntario-permissao.update';
import { BaseApi } from './BaseApi';

class MinisterioVoluntarioPermissoesApiClass extends BaseApi<
  ResponseMinisterioVoluntarioPermissaoDto,
  CreateMinisterioVoluntarioPermissaoDto,
  UpdateMinisterioVoluntarioPermissaoDto
> {
  constructor() {
    super('ministerio-voluntario-permissoes');
  }
}

export const MinisterioVoluntarioPermissoesApi = new MinisterioVoluntarioPermissoesApiClass();
