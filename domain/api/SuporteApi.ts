import { BaseApi } from './BaseApi';
import { ResponseSuporteDto } from '../dtos/Suporte/suporte.response';
import { CreateSuporteDto } from '../dtos/Suporte/suporte.create';

class SuporteApiClass extends BaseApi<ResponseSuporteDto, CreateSuporteDto> {
  constructor() {
    super('suporte');
  }
}

export const SuporteApi = new SuporteApiClass();
