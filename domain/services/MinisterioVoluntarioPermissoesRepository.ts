import { MinisterioVoluntarioPermissoesApi } from '../api/MinisterioVoluntarioPermissoesApi';
import { CreateMinisterioVoluntarioPermissaoDto } from '../dtos/MinisterioVoluntarioPermissao/ministerio-voluntario-permissao.create';
import { ResponseMinisterioVoluntarioPermissaoDto } from '../dtos/MinisterioVoluntarioPermissao/ministerio-voluntario-permissao.response';
import { UpdateMinisterioVoluntarioPermissaoDto } from '../dtos/MinisterioVoluntarioPermissao/ministerio-voluntario-permissao.update';
import { BaseRepository } from './BaseRepository';

class MinisterioVoluntarioPermissoesRepositoryClass extends BaseRepository<
  ResponseMinisterioVoluntarioPermissaoDto,
  CreateMinisterioVoluntarioPermissaoDto,
  UpdateMinisterioVoluntarioPermissaoDto
> {
  constructor() {
    super(MinisterioVoluntarioPermissoesApi);
  }
}

export const MinisterioVoluntarioPermissoesRepository = new MinisterioVoluntarioPermissoesRepositoryClass();
