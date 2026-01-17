import { CreateVoluntarioDto } from '../dtos/Voluntario/voluntario.create';
import { ResponseVoluntarioDto } from '../dtos/Voluntario/voluntario.response';
import { UpdateVoluntarioDto } from '../dtos/Voluntario/voluntario.update';
import { BaseApi } from './BaseApi';

class VoluntariosApiClass extends BaseApi<ResponseVoluntarioDto, CreateVoluntarioDto, UpdateVoluntarioDto> {
  constructor() {
    super('voluntarios');
  }
}

export const VoluntariosApi = new VoluntariosApiClass();
