import { CreateMinisterioVoluntarioDto } from '../dtos/MinisterioVoluntario/ministerio-voluntario.create';
import { ResponseMinisterioVoluntarioDto } from '../dtos/MinisterioVoluntario/ministerio-voluntario.response';
import { UpdateMinisterioVoluntarioDto } from '../dtos/MinisterioVoluntario/ministerio-voluntario.update';
import { BaseApi } from './BaseApi';

class MinisterioVoluntariosApiClass extends BaseApi<
  ResponseMinisterioVoluntarioDto,
  CreateMinisterioVoluntarioDto,
  UpdateMinisterioVoluntarioDto
> {
  constructor() {
    super('ministerio-voluntarios');
  }
}

export const MinisterioVoluntariosApi = new MinisterioVoluntariosApiClass();
